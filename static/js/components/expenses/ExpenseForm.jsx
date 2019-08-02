/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import FormGenerator from '../../utils/FromGenerator';
import QRCode from 'qrcode.react';
import '../../../css/expenses/expense.scss';
import { formatDecimal, generateNonce, toDatePicker, toLocalTimezone } from '../../utils/helpers';
import {
    EXPENSE_TOKEN_ADDED,
    createNewExpense,
    getExpense, editExpense, clearExpenses, expireToken
} from '../../actions/expenseActions';
import ws from '../../utils/ws';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import { hasAccess } from '../../utils/config';
import Spinner from '../../utils/Spinner';
import Table from '../../utils/Table';
import FontAwesome from '../../utils/FontAwesome';

export default class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onButtonContinue = this.onButtonContinue.bind(this);
        this.deleteReceiptScan = this.deleteReceiptScan.bind(this);
        const nonce = generateNonce();
        const editing = this.props.match.params.action === 'editar';

        if (editing) {
            this.props.dispatch(getExpense(this.props.match.params.expense_id, () => {
                const expense = this.props.expenses.data.list[0];
                if (typeof expense === 'undefined') {
                    this.props.history.push(ENDPOINTS.NOT_FOUND);
                }
                let d = '';
                if (expense.input_date) {
                    d = new Date(expense.input_date);
                    toLocalTimezone(d);
                    d = toDatePicker(d);
                }
                this.setState({
                    amount: expense.amount,
                    description: expense.description,
                    date: d,
                    expense_id: expense.id,
                });

                this.props.dispatch(editExpense(expense.id, { nonce }, ({ token, id, domain }) => {
                    this.setState({ expense_id: id, token, domain });
                    ws(EXPENSE_TOKEN_ADDED, `/expense-scans/${ token }/${ id }`, () => {
                        this.props.dispatch(getExpense(id));
                    });
                }));
            }));
        }

        this.state = {
            button: { value: 'Continuar', disabled: true },
            editing,
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
            ws(EXPENSE_TOKEN_ADDED, `/expense-scans/${ token }/${ id }`, () => {
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
        const canWrite = hasAccess(ENDPOINTS.EXPENSES_URL, ACCESS_TYPES.WRITE);
        const title = this.state.editing ? 'Ver/Editar Gasto' : 'Nuevo Gasto';

        return (
            <div>
                <Breadcrumbs { ...this.props } title={ title }/>
                <section className='widget'>
                    <h2>{ title }</h2>
                    { this.getForm(canWrite, this.state.editing) }
                    { this.renderQR() }
                    <div className='receipts'>
                        { this.renderReceiptPic(this.props.expenses.data, canWrite) }
                    </div>
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

    getForm(canWrite, editing) {
        if (editing && this.state.amount === '') {
            return <Spinner/>;
        }

        if (!canWrite) {
            return <Table rows={ [
                ['Monto', this.state.amount],
                ['Descripción', this.state.description],
                ['Fecha', this.state.date],
            ] }/>;
        }

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
        this.props.dispatch(clearExpenses());
        this.props.dispatch(expireToken(this.props.expenses.token));
    }

    renderQR() {
        const { expense_id, token, domain } = this.state;
        const path = ENDPOINTS.EXPENSE_SCANS_URL;
        if (token && expense_id) {
            return <div className='qr-section'>
                <h4>Escanea codigo QR con la camara del telefono para subir recibo</h4>
                <h6>Debes mantener esta ventana activa mientras escaneas.</h6>
                <QRCode
                    value={ `${ domain }${ path }/${ token }/${ expense_id }` }
                />
                <hr/>
            </div>;
        }
        return null;
    }

    renderReceiptPic({ list }, canDelete) {
        return list.length === 1 && list[0].signed_urls &&
            list[0].signed_urls.map((pic, i) =>
                <div key={ i }>
                    <img src={ pic } alt='recibo' onClick={ this.zoomImage } data-id={ i } className='receipt-scan'/>
                    <div>
                        { canDelete && <FontAwesome type={ 'trash' } onClick={ this.deleteReceiptScan } data-id={ i }/> }
                        { <FontAwesome type={ 'sync' } onClick={ this.rotate } data-id={ i }/> }
                    </div>
                </div>
            );
    }

    rotate({ target }) {
        console.log(target);
    }

    deleteReceiptScan({ target }) {
        console.log(target);
    }

    zoomImage({ target }) {
        console.log(target);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        expenses: PropTypes.object,
        match: PropTypes.object,
        history: PropTypes.object,
    };
}
