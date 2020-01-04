import api from '../utils/api';
import token from '../utils/token';
import { ENDPOINTS } from '../constants';

export const EMAIL_SENDING = 'EMAIL_SENDING';
export const EMAIL_SENT = 'EMAIL_SENT';
export const EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED';

export const sendEmailPdf = (png, model, modelId, template, title = '', resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EMAIL_SENDING });
        const formData = new FormData();
        formData.append('model_id', modelId);
        formData.append('model', model);
        formData.append('title', title);
        formData.append('template', template);
        formData.append('png', png);
        token.through().then(header =>
            api({
                url: `${ ENDPOINTS.EMAILS_URL }/pdf`,
                method: 'POST',
                headers: header
            }, formData, true).then(() => {
                dispatch({ type: EMAIL_SENT });
                resolve && resolve();
            }, reject)
        );
    };

export const sendEmailHtml = (body, model, modelId, template, title = '', resolve, reject) =>
    (dispatch) => {
        dispatch({ type: EMAIL_SENDING });
        const formData = new FormData();
        formData.append('model_id', modelId);
        formData.append('model', model);
        formData.append('title', title);
        formData.append('template', template);
        formData.append('body', body);
        token.through().then(header =>
            api({
                url: `${ ENDPOINTS.EMAILS_URL }/html`,
                method: 'POST',
                headers: header
            }, formData, true).then(() => {
                dispatch({ type: EMAIL_SENT });
                resolve && resolve();
            }, reject)
        );
    };
