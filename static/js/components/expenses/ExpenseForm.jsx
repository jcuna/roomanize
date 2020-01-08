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
    getExpense, editExpense, clearExpenses, expireToken, rotateReceipt, deleteReceipt
} from '../../actions/expenseActions';
import ws from '../../utils/ws';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import { hasAccess } from '../../utils/config';
import Spinner from '../../utils/Spinner';
import Table from '../../utils/Table';
import FontAwesome from '../../utils/FontAwesome';
import { hideOverlay, showOverlay, toggleMobileMenu } from '../../actions/appActions';

export default class ExpenseForm extends React.Component {
    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
        this.onButtonContinue = this.onButtonContinue.bind(this);
        this.rotate = this.rotate.bind(this);
        this.deleteReceiptScan = this.deleteReceiptScan.bind(this);
        this.zoomImage = this.zoomImage.bind(this);
        this.refreshExpense = this.refreshExpense.bind(this);
        this.returnMobileMenuDefault = this.returnMobileMenuDefault.bind(this);

        const nonce = generateNonce();
        const editing = this.props.match.params.action === 'editar';

        if (editing) {
            this.props.dispatch(getExpense(this.props.match.params.expense_id, () => {
                const expense = this.props.expenses.selected;
                if (typeof expense.id !== 'number') {
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
            processing_imgs: [],
        };
    }

    markImgProcessing(idx) {
        const processing_imgs = this.state.processing_imgs.slice(0);
        processing_imgs.push(idx);
        this.setState({
            processing_imgs
        });
    }

    refreshExpense(idx) {
        this.props.dispatch(getExpense(this.props.expenses.selected.id, () => {
            const imgs = this.state.processing_imgs.slice(0);
            imgs.splice(imgs.indexOf(idx), 1);
            this.setState({
                processing_imgs: []
            });
        }));
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
        const { expenses } = this.props;
        if (prevState.inputsValid !== inputsValid || inputsValid && (
            prevState.amount !== amount || prevState.description !== description || prevState.date !== date)) {
            this.setState({
                button: { ...this.state.button, disabled: !this.state.inputsValid }
            });
        }
        if (expenses.selected.signed_urls[0] && prevProps.expenses.selected.signed_urls.length > 0 &&
            expenses.selected.signed_urls[0] !== prevProps.expenses.selected.signed_urls[0]) {
            this.forceUpdate();
        }
    }

    render() {
        const canWrite = hasAccess(ENDPOINTS.EXPENSES_URL, ACCESS_TYPES.WRITE);
        const title = this.state.editing ? 'Ver/Editar Gasto' : 'Nuevo Gasto';

        return (
            <div>
                <Breadcrumbs { ...this.props } title={ title }/>
                <div className='widget'>
                    <section className='widget-child'>
                        <h2>{ title }</h2>
                        { this.getForm(canWrite, this.state.editing) }
                        { this.renderQR() }
                        <div className='receipts'>
                            { this.renderReceiptPics(this.props.expenses.selected, canWrite) }
                        </div>
                    </section>
                </div>
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

    renderReceiptPics({ signed_urls }, canDelete) {
        return signed_urls.map(({ thumbnail }, i) =>
            <div key={ i } className={ this.state.processing_imgs.includes(i) ? 'img-processing' : '' }>
                <img src={ thumbnail } alt='recibo' onClick={ this.zoomImage } data-id={ i } className='receipt-scan'/>
                <ul>
                    <li><FontAwesome type={ 'sync' } onClick={ this.rotate } data-id={ i }/></li>
                    <li>
                        { canDelete && <FontAwesome type={ 'trash' } onClick={ this.deleteReceiptScan } data-id={ i }/> }
                    </li>
                    <li className='mirror'>
                        <FontAwesome type={ 'sync' } onClick={ this.rotate } data-id={ i }/>
                    </li>
                </ul>
            </div>
        );
    }

    rotate(e) {
        e.persist();
        let dir = 'right';
        if (e.target.parentElement.parentElement.classList.contains('mirror')) {
            dir = 'left';
        }

        const el = document.getElementsByClassName('receipt-full')[0];
        if (this.props.overlay.display) {
            el.classList.add('img-loading');
        }
        const { target } = e;
        const index = Number(target.getAttribute('data-id'));
        this.markImgProcessing(index);
        const data = {
            object_name: this.props.expenses.selected.signed_urls[index].object,
            dir
        };
        this.props.dispatch(rotateReceipt(this.state.token, this.state.expense_id, data, () => {
            if (this.props.overlay.display) {
                this.zoomImage(e);
            }
            this.refreshExpense(index);
        }));
    }

    deleteReceiptScan({ target }) {
        const button = <button
            type='button' onClick={ () => {
                this.props.dispatch(showOverlay(<section className='img-loading'><div/></section>));
                const index = Number(target.getAttribute('data-id'));
                this.markImgProcessing(index);
                const obj = this.props.expenses.selected.signed_urls[index].object;
                this.props.dispatch(deleteReceipt(this.state.token, this.state.expense_id, obj, () => {
                    this.props.dispatch(hideOverlay());
                    this.refreshExpense(index);
                    this.props.dispatch(this.returnMobileMenuDefault());
                }));
            } } className='btn btn-danger'>Confirmar</button>;

        this.props.dispatch(showOverlay(
            <div className='panel'>Estas seguro que borrar la imagen seleccionada?</div>,
            <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
            true,
            button, this.returnMobileMenuDefault),
        );
    }

    zoomImage({ target }) {
        const index = Number(target.getAttribute('data-id'));
        const canDelete = hasAccess(ENDPOINTS.EXPENSES_URL, ACCESS_TYPES.WRITE);
        const { expenses: { selected }} = this.props;

        this.props.dispatch(showOverlay(
            // adding a key to ensure rendering upon actions.
            <section className={ 'receipt-full img-loading' } key={ Math.floor(Math.random() * 100) }>
                <div>
                    <img
                        src={ selected.signed_urls[index].full } alt='recibo'
                        onError={ this.refreshExpense }
                        onLoad={ () => {
                            const el = document.getElementsByClassName('receipt-full')[0];
                            el.classList.remove('img-loading');
                        } }
                    />
                    <ul>
                        <li><FontAwesome type={ 'sync' } onClick={ this.rotate } data-id={ index }/></li>
                        <li>
                            { canDelete && <FontAwesome type={ 'trash' } onClick={ this.deleteReceiptScan } data-id={ index }/> }
                        </li>
                        <li className='mirror'>
                            <FontAwesome type={ 'sync' } onClick={ this.rotate } data-id={ index }/>
                        </li>
                    </ul>
                </div>
            </section>, '', false, null, this.returnMobileMenuDefault
        ));
    }

    returnMobileMenuDefault() {
        const showMobile = this.props.user.attributes.preferences.showMobileMenu;
        showMobile && this.props.dispatch(toggleMobileMenu(showMobile));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        expenses: PropTypes.object,
        match: PropTypes.object,
        history: PropTypes.object,
        overlay: PropTypes.object,
        user: PropTypes.object,
    };
}
