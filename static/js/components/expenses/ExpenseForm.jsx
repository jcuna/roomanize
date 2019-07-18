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
    getExpenseToken,
    getUploadedPics
} from '../../actions/expenseActions';
import ws from '../../utils/ws';
import Spinner from '../../utils/Spinner';

export default class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        const nonce = generateNonce();

        this.state = {
            button: {value: 'Agregar', disabled: true},
            amount: '',
            description: '',
            inputsValid: false,
            nonce,
            token: null,
        };

        this.props.dispatch(getExpenseToken(nonce, (token) => {
            ws(EXPENSE_TOKEN_ADDED, `/expenses-token/${ token }`, () => {
                this.props.dispatch(getUploadedPics(token));
            });
        }));
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
        if (validate.amount.isValid && validate.description.isValid) {
            this.setState({inputsValid: true});
        }
    }

    getForm() {
        return <FormGenerator
            formName='expense-form'
            button={ this.state.button }
            elements={ [
                {
                    name: 'amount',
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
            ] }
        />;
    }

    componentWillUnmount() {
        this.props.dispatch(clearScanUrl());
    }

    renderQR() {
        if (this.props.expenses.token) {
            return <div className='qr-section'>
                <h4>Escanea codigo QR con la camara del telefono para subir recibo</h4>
                <QRCode value={ this.props.expenses.scan_url + '/' + this.props.expenses.token }/>
                <div className='receipts'>
                    { ExpenseForm.renderReceiptPic(this.props.expenses) }
                </div>
            </div>;
        }
        return <Spinner/>;
    }

    static renderReceiptPic({ scans }) {
        return scans.map((pic, i) => <img key={ i } src={ pic } alt='recibo'/>);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        expenses: PropTypes.object,
    };
}
