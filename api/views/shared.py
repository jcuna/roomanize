import base64
import re
from datetime import datetime
from io import BytesIO
from urllib.parse import unquote

import pdfkit
import pytz

from PIL import Image
from flask import request, current_app, render_template, send_file
from flask_mail import Message
from markupsafe import Markup

from config import configs
from core import API
from core.middleware import HttpException
from dal.models import Tenant, User
from dal.shared import token_required, db
from views import Result


ACTION_PDF = 'pdf'
ACTION_HTML = 'html'
TAG_RE = re.compile(r'<[^>]+>')

class Email(API):

    @token_required
    def post(self, action):
        model_id = request.form.get('model_id')
        model = request.form.get('model')

        title = request.form.get('title')
        template = request.form.get('template')
        if not model or not model_id or not template:
            raise HttpException('missing required values')

        q = db.session.query()
        if model == 'user':
            email = q.add_columns(User.email).filter(User.id == model_id).first()
        elif model == 'tenant':
            email = q.add_columns(Tenant.email).filter(Tenant.id == model_id).first()
        else:
            raise HttpException('Invalid model')

        if email is not None:

            if action == ACTION_PDF:
                meta, png = request.form.get('png').split(',')
                email_pdf(email.email, BytesIO(base64.b64decode(png)), template, title)
                return Result.success()
            elif action == ACTION_HTML:
                body = request.form.get('body')
                email_html(email.email, base64.b64decode(body).decode(), template, title)
                return Result.success()

        raise HttpException('invalid request')


def email_pdf(email: str, png: BytesIO, template, title=''):
    date = datetime.now(tz=pytz.timezone(configs.TIME_ZONE)).strftime('%m-%d-%Y %I:%M:%S %p')
    msg = Message('Recibo %s' % date, recipients=[email])

    rgba = Image.open(png)
    rgb = Image.new('RGB', rgba.size, (255, 255, 255))  # white background
    rgb.paste(rgba, mask=rgba.split()[3]) # paste using alpha channel as mask
    pdf = BytesIO()
    rgb.save(pdf, 'PDF', quality=95, optimize=True)

    msg.attach('recibo-%s.pdf' % date, 'application/pdf', pdf.getvalue(), 'attachment')
    msg.html = render_template(
        template,
        body=Markup('<h3>%s</h3>' % title)
    )
    current_app.mail(msg)


def email_html(email: str, body, template, title=''):
    date = datetime.now(tz=pytz.timezone(configs.TIME_ZONE)).strftime('%m-%d-%Y %I:%M:%S %p')
    msg = Message('Recibo %s' % date, recipients=[email])

    msg.html = render_template(
        template,
        body=Markup('<h3>%s</h3>%s' % (title, body))
    )
    msg.body = '%s\n' % title + TAG_RE.sub('\n', body)
    current_app.mail(msg)


class HtmlToPdf(API):

    @token_required
    def post(self):
        extra_css = []
        styles = ''
        data = request.get_json()
        if data is None or 'html' not in data or 'uid' not in data:
            raise HttpException('Missing necessary arguments')
        html = unquote(base64.b64decode(data['html']).decode())
        filename = data['uid'] + '.pdf'
        if 'extra_css' in data:
            extra_css = [unquote(base64.b64decode(link).decode()) for link in data['extra_css']]

        if 'style' in data:
            styles = unquote(base64.b64decode(data['style']).decode())

        template = render_template('print.html', body=Markup(html), styles=Markup(styles), extra_css=extra_css)

        with open('file.html', 'w') as pdf:
            pdf.write(template)

        fp = BytesIO()
        pdfkit.from_file('file.html', 'out.pdf')

        return send_file('out.pdf', attachment_filename=filename)
