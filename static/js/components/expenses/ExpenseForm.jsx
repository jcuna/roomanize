/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import FormGenerator from '../../utils/FromGenerator';
import QRCode from 'qrcode.react';
import '../../../css/expenses/expense.scss';
import { formatDecimal, generateNonce } from '../../utils/helpers';
import {
    clearScanUrl,
    EXPENSE_TOKEN_ADDED,
    createNewExpense,
    getExpense
} from '../../actions/expenseActions';
import ws from '../../utils/ws';
import { ENDPOINTS } from '../../constants';

export default class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onButtonContinue = this.onButtonContinue.bind(this);
        const nonce = generateNonce();

        this.state = {
            button: { value: 'Continuar', disabled: true },
            amount: '',
            description: '',
            date: '',
            inputsValid: false,
            nonce,
            token: null,
            expense_id: null,
        };
    }

    onButtonContinue(e, validate) {
        this.setState({ button: { ...this.state.button, disabled: true }});
        const payload = {
            nonce: this.state.nonce,
            amount: validate.amount.value,
            description: validate.description.value,
            date: validate.date.value,
        };

        this.props.dispatch(createNewExpense(payload, ({ token, id, domain }) => {
            this.setState({ expense_id: id, token, domain });
            ws(EXPENSE_TOKEN_ADDED, `/expense-scans/${ token }/${id}`, () => {
                this.props.dispatch(getExpense(id));
            });
        }));
    }

    componentDidUpdate(prevProps, prevState) {
        const { inputsValid, amount, description, date } = this.state;
        if (prevState.inputsValid !== inputsValid || inputsValid && (
            prevState.amount !== amount || prevState.description !== description || prevState.date !== date)) {
            this.setState({
                button: { ...this.state.button, disabled: !this.state.inputsValid }
            });
        }
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props } title='Nuevo'/>
                <section className='widget'>
                    <h2>Agregar Gastos</h2>
                    { this.getForm() }
                    { this.renderQR() }
                </section>
            </div>
        );
    }

    onInputChange(e, validate) {
        if (e.target.getAttribute('name') === 'amount') {
            formatDecimal(e);
        }
        this.setState({
            inputsValid: validate.amount.isValid && validate.description.isValid && validate.date.isValid,
            date: validate.date.value,
            description: validate.description.value,
            amount: validate.amount.value,
        });
    }

    getForm() {
        return <FormGenerator
            formName='expense-form'
            button={ this.state.button }
            onSubmit={ this.onButtonContinue }
            elements={ [
                {
                    name: 'amount',
                    autoComplete: 'off',
                    placeholder: 'Cantidad',
                    defaultValue: this.state.amount,
                    validate: ['number', 'required'],
                    onChange: this.onInputChange,
                },
                {
                    name: 'description',
                    formElement: 'textarea',
                    placeholder: 'Descrición',
                    defaultValue: this.state.description,
                    validate: ['required'],
                    onChange: this.onInputChange,
                },
                {
                    name: 'date',
                    type: 'date',
                    label: 'Fecha en el recibo',
                    defaultValue: this.state.date,
                    validate: ['required'],
                    onChange: this.onInputChange,
                },
            ] }
        />;
    }

    componentWillUnmount() {
        this.props.dispatch(clearScanUrl());
    }

    renderQR() {
        const { expense_id, token, domain } = this.state;
        const path = ENDPOINTS.EXPENSE_SCANS_URL;
        if (token && expense_id) {
            console.log(`${ domain }${ path }/${ token }/${ expense_id }`);
            return <div className='qr-section'>
                <h4>Escanea codigo QR con la camara del telefono para subir recibo</h4>
                <QRCode
                    value={ `${ domain }${ path }/${ token }/${ expense_id }` }
                />
                <div className='receipts'>
                    { ExpenseForm.renderReceiptPic(this.props.expenses) }
                </div>
            </div>;
        }
        return null;
    }

    static renderReceiptPic({ scans }) {
        return scans.map((pic, i) => <img key={ i } src={ pic } alt='recibo' className='receipt-scan'/>);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        expenses: PropTypes.object,
    };
}
