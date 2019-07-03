/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { clearSelectedTenant, createTenant, editTenant, getTenant } from '../../actions/tenantsAction';
import { hideOverlay, notifications, showOverlay } from '../../actions/appActions';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import Spinner from '../../utils/Spinner';
import Table from '../../utils/Table';
import Link from 'react-router-dom/es/Link';
import { setAgreement, updateAgreement } from '../../actions/agreementsAction';
import { formatDateEs, formatPhone } from '../../utils/helpers';
import '../../../css/tenants/tenantform.scss';
import FontAwesome from '../../utils/FontAwesome';
import Button from '../../utils/Button';
import PaymentForm from '../payments/PaymentForm';
import { fetchPaymentTypes } from '../../actions/projectActions';
import { hasAccess } from '../../utils/config';

export default class TenantForm extends React.Component {
    constructor(props) {
        super(props);

        this.formSubmit = this.formSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.newAgreementRegistration = this.newAgreementRegistration.bind(this);
        this.confirmEndAgreement = this.confirmEndAgreement.bind(this);
        this.lastDateChanged = this.lastDateChanged.bind(this);
        this.newPayment = this.newPayment.bind(this);

        const tenant_id = this.props.match.params.tenant_id || null;
        const { dispatch } = this.props;
        this.lastDateInput = React.createRef();

        this.state = {
            lastDate: null,
            notFound: false,
            button: {
                disabled: true,
                className: 'col-6',
                value: tenant_id ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            ...this.props.tenants.selectedTenant,
        };

        if (this.props.projects.paymentTypes.length === 0) {
            this.props.dispatch(fetchPaymentTypes());
        }

        if (tenant_id) {
            dispatch(getTenant(tenant_id, null, () => {
                this.setState({ notFound: true });
            }));
        }
    }

    componentDidUpdate(prevProps, { id }) {
        if (this.props.tenants.selectedTenant && id !== this.props.tenants.selectedTenant.id) {
            this.setState({
                ...this.state, ...this.props.tenants.selectedTenant,
                button: {
                    ...this.state.button,
                    disabled: true,
                    value: 'Actualizar',
                },
            });
        }
        if (prevProps.match.params.tenant_id !== this.props.match.params.tenant_id) {
            this.props.dispatch(getTenant(this.props.match.params.tenant_id, null, () => {
                this.setState({ notFound: true });
            }));
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearSelectedTenant());
    }

    render() {
        const editing = this.state.id !== null;
        const canUpdateAgreement = hasAccess(ENDPOINTS.AGREEMENTS_URL, ACCESS_TYPES.WRITE);
        const canProcessPayments = hasAccess(ENDPOINTS.BALANCE_PAYMENTS_URL, ACCESS_TYPES.WRITE);

        return <div>
            <Breadcrumbs { ...this.props } title={ editing ? 'Editar' : 'Nuevo' }/>
            <section className='widget'>
                { (!this.state.id && this.props.match.params.tenant_id) && <Spinner/> ||
                <FormGenerator
                    formName={ 'new-tenant' }
                    inlineSubmit={ true }
                    onSubmit={ this.formSubmit }
                    className={ 'form-group row' }
                    elements={ [
                        {
                            className: 'col-6',
                            name: 'first_name',
                            placeholder: 'Nombre',
                            defaultValue: this.state.first_name,
                            validate: 'required',
                            onChange: this.onInputChange,
                        },
                        {
                            className: 'col-6',
                            name: 'last_name',
                            placeholder: 'Apellidos',
                            defaultValue: this.state.last_name,
                            validate: 'required',
                            onChange: this.onInputChange,
                        },
                        {
                            className: 'col-6',
                            name: 'email',
                            placeholder: 'Email',
                            defaultValue: this.state.email,
                            validate: 'email',
                            onChange: this.onInputChange,
                        },
                        {
                            className: 'col-6',
                            name: 'phone',
                            placeholder: 'Telefono',
                            defaultValue: this.state.phone,
                            validate: ['phone', 'required'],
                            onChange: this.onInputChange,
                        },
                        {
                            className: 'col-6',
                            name: 'identification_number',
                            placeholder: 'Cedula (000-0000000-1)',
                            defaultValue: this.state.identification_number,
                            validate: ['required', 'regex:^[0-9]{3}-[0-9]{7}-[0-9]'],
                            onChange: this.onInputChange,
                        },
                    ] }
                    button={ this.state.button }
                /> }
            </section>

            { editing && <div className='table-actions'>
                <button
                    onClick={ this.newAgreementRegistration }
                    className='btn btn-success'>
                    Nueva Registración
                </button>
            </div> }

            {
                this.props.tenants.selectedTenant.history.length > 0 &&
                TenantForm.displayTenantHistory(
                    this.props.tenants.selectedTenant.history,
                    this.confirmEndAgreement,
                    this.newPayment,
                    canProcessPayments,
                    canUpdateAgreement
                )
            }
        </div>;
    }

    newAgreementRegistration() {
        const { tenants, dispatch } = this.props;
        dispatch(setAgreement({
            tenant: {
                name: tenants.selectedTenant.first_name + ' ' + tenants.selectedTenant.last_name,
                identification_number: tenants.selectedTenant.identification_number,
                id: tenants.selectedTenant.id,
            }
        }));
        this.props.history.push(`${ ENDPOINTS.AGREEMENTS_URL }/nuevo`);
    }

    static displayTenantHistory(history, onFinalize, newPayment, canProcessPayments, canUpdateAgreements) {
        history.sort((a, b) => new Date(b.rental_agreement.entered_on) - new Date(a.rental_agreement.entered_on));

        return <div className="tenant-history">
            <h2>Historial</h2>
            {
                history.map((row, i) => {
                    const items = [];
                    let active = true;

                    if (row.rental_agreement.terminated_on) {
                        active = false;
                        const date = new Date(row.rental_agreement.terminated_on);
                        items.push(['Contrato Terminado en:', date.toDateString()]);
                    } else {
                        const date = new Date(row.rental_agreement.entered_on);
                        items.push(['En vigencia desde', formatDateEs(date)]);
                    }

                    items.push([
                        'No: Habitacion',
                        <Link key={ i }
                            to={ `${ ENDPOINTS.ROOMS_URL }/editar/${ row.rental_agreement.room.id }` }>
                            { row.rental_agreement.room.name }
                        </Link>,
                    ]);

                    items.push(['Referencia I', formatPhone(row.reference1_phone)]);
                    if (row.reference2_phone) {
                        items.push(['Referencia II', formatPhone(row.reference2_phone)]);
                    }

                    if (row.reference3_phone) {
                        items.push(['Referencia III', formatPhone(row.reference3_phone)]);
                    }

                    items.push(['Arrendamiento', `RD$ ${row.rental_agreement.rate}`]);

                    // balances are sorted in the back end desc by date, so the most recent balance will be at index 0
                    const { balance } = row.rental_agreement;
                    if (active) {
                        if (balance.length > 0) {
                            let last_payment = 'Nunca';

                            if (balance.length > 0) {
                                if (typeof balance[1] !== 'undefined' && typeof balance[1].payments !== 'undefined') {
                                    last_payment = TenantForm.createLastPaymentComponent(balance[1].payments);
                                } else if (typeof balance[0] !== 'undefined' &&
                                    typeof balance[0].payments !== 'undefined') {
                                    last_payment = TenantForm.createLastPaymentComponent(balance[0].payments);
                                }
                            }
                            let credit = 0;
                            let remaining_balance = balance[0].balance;
                            if (typeof balance[0].payments !== 'undefined') {
                                balance[0].payments.forEach(payment => remaining_balance -= Number(payment.amount));
                            }
                            if (remaining_balance < 0) {
                                credit = Math.abs(remaining_balance);
                                remaining_balance = 0;
                            }

                            remaining_balance > 0 && items.push(
                                ['Proximo Pago', formatDateEs(new Date(balance[0].due_date))]
                            );
                            items.push(['Balance', `$RD ${ remaining_balance }`]);
                            credit > 0 && items.push(['Credito', `$RD ${ credit }`]);
                            items.push(['Ultimo Pago', last_payment]);
                        }
                        canUpdateAgreements && items.push([
                            'Finalizar Contrato',
                            <Button
                                type='warning'
                                size='sm'
                                key={ row.id }
                                data-id={ row.id }
                                onClick={ onFinalize }
                                value='Terminar'
                            />
                        ]);
                    }

                    canProcessPayments && items.push([
                        '',
                        <Button
                            type='info'
                            key={ row.id + 1 } data-id={ row.id }
                            value='Effectuar Pago'
                            size='sm'
                            onClick={ newPayment }
                        />
                    ]);

                    return (
                        <div key={ i }>
                            <Table numberedRows={ false } rows={ items }/>
                            <hr/>
                        </div>
                    );
                })
            }
        </div>;
    }

    newPayment({ target }) {
        this.props.dispatch(showOverlay(
            <PaymentForm { ...this.props } target_id={ target.getAttribute('data-id') }/>,
            'Hacer un Pago',
            true
        ));
    }

    lastDateChanged(e, validate) {
        if (validate['last-date'].isValid) {
            this.setState({ lastDate: validate['last-date'].value });
        }
    }

    confirmEndAgreement({ target }) {
        const button = <button
            type='button' onClick={ () => {
                if (!this.state.lastDate) {
                    this.lastDateInput.current.classList.add('is-invalid');
                } else {
                    const data = {
                        id: target.getAttribute('data-id'),
                        terminated_on: this.state.lastDate
                    };
                    this.lastDateInput.current.classList.remove('is-invalid');
                    this.props.dispatch(updateAgreement(data, () => {
                        this.props.dispatch(hideOverlay());
                        this.props.dispatch(notifications({
                            type: ALERTS.SUCCESS, message: 'Contrato terminado correctamente'
                        }));
                        this.props.dispatch(getTenant(this.props.match.params.tenant_id));
                    }, err => {
                        this.props.dispatch(hideOverlay());
                        this.props.dispatch(notifications({
                            type: ALERTS.DANGER, message: err.resp.error || GENERIC_ERROR
                        }));
                    }));
                }
            } } className='btn btn-warning'>OK</button>;

        this.props.dispatch(showOverlay(
            <div>
                <h4 className='panel'>Estas seguro que deseas finalizar este contrato?</h4>
                <FormGenerator formName='contract-end' elements={ [{
                    name: 'last-date',
                    type: 'date',
                    placeholder: 'Fecha',
                    onChange: this.lastDateChanged,
                    validate: ['required'],
                    ref: this.lastDateInput
                }] }/>
                <small className=''>Seleccione la fecha de termino. Solo hoy y fechas pasadas.</small>
            </div>,
            <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
            true,
            button
        ));
    }

    static createLastPaymentComponent(payments) {
        const by_date = payments.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
        return (
            <span className='last-payment'>
                <span>{ formatDateEs(new Date(by_date[0].paid_date)) }</span>
                <span className='amount'>{ `($RD ${ by_date[0].amount })` }</span>
            </span>
        );
    }

    formSubmit(e, obj) {
        let action = createTenant;
        let verb = 'agregado';
        const data = {};

        if (this.state.id) {
            data.id = this.state.id;
            verb = 'actualizado';
            action = editTenant;
        }

        Object.keys(obj).forEach(name => data[name] = obj[name].value);

        this.props.dispatch(action(data, (tenant_id) => {
            if (tenant_id) {
                this.props.history.push(`${ ENDPOINTS.TENANTS_URL }/editar/${ tenant_id }`);
            } else {
                this.props.history.push(ENDPOINTS.TENANTS_URL);
            }
            this.props.dispatch(notifications({
                type: ALERTS.SUCCESS,
                message: `Inquilino ${ verb } correctamente`,
            }));
        }, () => {
            this.props.dispatch(notifications({
                type: ALERTS.DANGER,
                message: GENERIC_ERROR,
            }));
        }));
    }

    onInputChange(e, validate) {
        let isValid = true;
        Object.keys(validate).forEach(item => {
            if (!validate[item].isValid) {
                isValid = false;
            }
        });

        this.setState({
            button: { ...this.state.button, disabled: !isValid },
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        tenants: PropTypes.object,
        history: PropTypes.object,
        projects: PropTypes.object,
    };
}
