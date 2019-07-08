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
import Table from '../../utils/Table';

export default class PaymentForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.submitPayment = this.submitPayment.bind(this);

        this.amountInput = React.createRef();

        this.state = {
            button: { value: 'Confirmar Pago', disabled: true },
            paymentType: this.props.defaultPaymentType,
            change: 0,
            showChange: false,
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
        return <div>
            <FormGenerator
                formName='payment-form'
                button={ this.state.button }
                onSubmit={ this.submitPayment }
                elements={ this.getFormElements() }
            />
            { this.state.showChange && this.getChangeElement() }
        </div>;
    }

    getChangeElement() {
        return <div className='payment-change'>
            <Table numberedRows={ false } rows={ [['Cambio:', (this.state.change > 0 && this.state.change || 0)]] }/>
        </div>;
    }

    getFormElements() {
        const elements = [
            {
                name: 'amount',
                placeholder: 'Monto A Pagar $RD',
                defaultValue: '',
                validate: ['required', 'number'],
                onChange: this.onInputChange,
                ref: this.amountInput,
                autoComplete: 'off',
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
        ];
        if (this.state.paymentType === 100) {
            elements.push(
                {
                    name: 'cash',
                    placeholder: 'Cantidad en Effectivo',
                    defaultValue: '',
                    validate: ['required', 'number'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                }
            );
        }
        return elements;
    }

    getPaymentTypes() {
        const options = [];

        options[0] = 'Tipo de pago';

        this.props.projects.paymentTypes.forEach(
            item => options[item.id] = item.type);
        return options;
    }

    onInputChange(e, { amount, payment_type_id, cash }) {
        const state = {
            paymentType: Number(payment_type_id.value)
        };

        const validData = amount.isValid && payment_type_id.isValid;
        const validCashPayment = validData && Number(payment_type_id.value) === this.props.defaultPaymentType &&
            cash.isValid;

        if (validData && Number(payment_type_id.value) !== this.props.defaultPaymentType || validCashPayment) {
            state.button = { ...this.state.button, disabled: false };
            if (validCashPayment) {
                state.change = (Number(cash.value) - Number(amount.value)).toFixed(2);
                state.showChange = true;
            } else {
                state.change = 0;
                state.showChange = false;
            }
        } else {
            state.button = { ...this.state.button, disabled: true };
            state.change = 0;
            state.showChange = false;
        }
        this.setState(state);
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

    componentDidUpdate(prevProps, prevState) {
        if (prevState.paymentType !== this.state.paymentType) {
            this.forceUpdate();
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        target_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // id of the balance or item being paid for
        type: PropTypes.string,
        projects: PropTypes.object,
        history: PropTypes.object,
        defaultPaymentType: PropTypes.number,
    };

    static defaultProps = {
        type: 'agreement', // not used at the moment, but will likely be useful for payments of other types.
        defaultPaymentType: 100, // not used at the moment, but will likely be useful for payments of other types.
    };
}
