/**
 * Created by Jon on 2019-07-02.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { fetchPaymentTypes } from '../../actions/projectActions';
import { makePayment } from '../../actions/agreementsAction';
import { hideOverlay, notifications } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';

export default class PaymentForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.submitPayment = this.submitPayment.bind(this);

        this.state = {
            button: { value: 'Confirmar Pago', disabled: true },
        };

        if (this.props.projects.paymentTypes.length === 0) {
            this.props.dispatch(fetchPaymentTypes());
        }
    }

    render() {
        return (
            <div>
                { this.form }
            </div>
        );
    }

    get form() {
        return <FormGenerator
            formName='payment-form'
            button={ this.state.button }
            onSubmit={ this.submitPayment }
            elements={ [
                {
                    name: 'amount',
                    placeholder: 'Cantidad $RD',
                    defaultValue: '',
                    validate: ['required', 'number'],
                    onChange: this.onInputChange,
                },
                {
                    name: 'payment_type_id',
                    placeholder: 'Cantidad',
                    validate: 'required',
                    onChange: this.onInputChange,
                    formElement: 'select',
                    defaultValue: 100,
                    options: this.getPaymentTypes(),
                },
            ] }
        />;
    }

    getPaymentTypes() {
        const options = [];

        options[0] = 'Tipo de pago';

        this.props.projects.paymentTypes.forEach(
            item => options[item.id] = item.type);
        return options;
    }

    onInputChange(e, { amount, payment_type_id }) {
        if (amount.isValid && payment_type_id.isValid) {
            this.setState({
                button: { ...this.state.button, disabled: false }
            });
        }
    }

    submitPayment(e, { amount, payment_type_id }) {
        const data = {
            balance_id: Number(this.props.target_id),
            payment_type_id: payment_type_id.value,
            amount: amount.value,
        };

        this.props.dispatch(makePayment(data, (resp) => {
            this.props.dispatch(hideOverlay());
            this.props.dispatch(notifications({
                type: ALERTS.SUCCESS,
                message: 'Pago procesado correctamente'
            }));
            this.props.history.push(`${ ENDPOINTS.RECEIPTS_URL }/recibo/${resp.id}`);
        }, () => {
            this.props.dispatch(hideOverlay());
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        target_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // id of the balance or item being paid for
        type: PropTypes.string,
        projects: PropTypes.object,
        history: PropTypes.object,
    };

    static defaultProps = {
        type: 'agreement', // not used at the moment, but will likely be useful for payments of other types.
    };
}
