/**
 * Created by Jon on 2019-07-05.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../utils/Table';
import { b64EncodeUnicode, formatPhone, friendlyDateEs, toLocalTimezone } from '../../utils/helpers';
import '../../../css/receipts/receipt.scss';
import FontAwesome from '../../utils/FontAwesome';
import { ENDPOINTS } from '../../constants';
import { Link } from 'react-router-dom';
import { sendEmailHtml } from '../../actions/emailActions';
import ReactDOMServer from 'react-dom/server';
import Spinner from '../../utils/Spinner';

export default class Receipt extends React.Component {
    constructor(props) {
        super(props);

        this.email = this.email.bind(this);
        this.node = React.createRef();
        this.state = {
            showSpinner: false
        };
    }

    render() {
        const { renderEmail, project, receipt, timeIntervals, paymentTypes, onPrint, id } = this.props;
        const paymentType = paymentTypes.length > 0 &&
            paymentTypes.filter(a => Number(a.id) === Number(receipt.payment_type_id)).pop().type;
        const enteredOn = new Date(receipt.balance.agreement.entered_on);
        const paidDate = new Date(receipt.paid_date);
        toLocalTimezone(enteredOn);
        toLocalTimezone(paidDate);
        return (
            <div id={ id || receipt.id } className={ `receipt-wrapper` + (this.state.showSpinner ? ' blocking' : '') }>
                { this.state.showSpinner && <Spinner/> }
                <section className='widget receipt'>
                    { !renderEmail && <div>
                        <FontAwesome
                            className='print-button'
                            type='print'
                            data-id={ receipt.id }
                            title='imprimir'
                            onClick={ onPrint }
                        />
                        { receipt.user.email !== '' &&
                            <FontAwesome className='email-button' type='paper-plane' title='email' onClick={ this.email }/> }
                    </div> }
                    <div className='content' ref={ this.node }><div className='header'>
                        <h4>{ project.name }</h4>
                        <small>{ project.address }</small>
                        <br/>
                        <small>{ formatPhone(project.contact) }</small>
                    </div>
                    <span className='divider'/>
                    <h5>Recibo De pago</h5>
                    <span className='divider'/>
                    <Table numberedRows={ false } rows={ [
                        ['# De Recibo', receipt.id],
                        ['Inquilino',
                            this.getNameComponent(receipt)
                        ],
                        ['Telefono', formatPhone(receipt.user.phone)],
                        ['Inquilino Desde', friendlyDateEs(enteredOn)],
                        ['Ciclo De Pago',
                            timeIntervals.length > 0 && timeIntervals.filter(a =>
                                Number(a.id) === Number(receipt.balance.agreement.time_interval_id)).pop().interval
                        ],
                        ['-----------', '-----------'],
                        ['Fecha De Pago', friendlyDateEs(paidDate)],
                        ['Balance Ciclo Anterior', receipt.balance.previous_balance],
                        ['Pago en ' + paymentType, receipt.amount],
                    ] }/></div>
                </section>
            </div>
        );
    }

    getNameComponent(receipt) {
        if (this.props.renderEmail) {
            return <div key={ receipt.user.phone }>{ receipt.user.first_name + ' ' + receipt.user.last_name }</div>;
        }
        return (
            <Link
                to={ `${ ENDPOINTS.TENANTS_URL}/editar/${receipt.user.id }` }
                key={ receipt.user.phone }>
                { receipt.user.first_name + ' ' + receipt.user.last_name }
            </Link>
        );
    }

    email() {
        this.setState({ showSpinner: true });
        const body = b64EncodeUnicode(ReactDOMServer.renderToStaticMarkup(<Receipt { ...this.props } renderEmail={ true } />));
        this.props.dispatch(sendEmailHtml(
            body,
            'tenant',
            this.props.receipt.user.id,
            'email/receipt.html',
            '',
            () => this.setState({ showSpinner: false })
        ));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        receipt: PropTypes.object,
        project: PropTypes.object,
        timeIntervals: PropTypes.array,
        paymentTypes: PropTypes.array,
        onPrint: PropTypes.func,
        id: PropTypes.string,
        renderEmail: PropTypes.bool,
    };

    static defaultProps = {
        renderEmail: false,
    }
}
