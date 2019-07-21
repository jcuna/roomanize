/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { clearSelectedTenant, createTenant, editTenant, getTenant } from '../../actions/tenantsAction';
import Spinner from '../../utils/Spinner';
import { setAgreement } from '../../actions/agreementsAction';
import '../../../css/tenants/tenantform.scss';
import { fetchPaymentTypes, fetchTimeIntervals } from '../../actions/projectActions';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { notifications } from '../../actions/appActions';
import TenantHistory from './TenantHistory';
import { hasAccess } from '../../utils/config';

export default class TenantForm extends React.Component {
    constructor(props) {
        super(props);

        this.formSubmit = this.formSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.newAgreementRegistration = this.newAgreementRegistration.bind(this);

        const tenant_id = this.props.match.params.tenant_id || null;

        this.state = {
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

        if (props.projects.timeIntervals.length === 0) {
            props.dispatch(fetchTimeIntervals());
        }

        if (tenant_id) {
            props.dispatch(getTenant(tenant_id, null, () => {
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
                <TenantHistory
                    dispatch={ this.props.dispatch }
                    match={ this.props.match }
                    selectedTenant={ this.props.tenants.selectedTenant }
                    projects={ this.props.projects }
                    timeIntervals={ this.props.timeIntervals }
                    canProcessPayments={ hasAccess(ENDPOINTS.AGREEMENTS_URL, ACCESS_TYPES.WRITE) &&
                        hasAccess(ENDPOINTS.AGREEMENTS_URL, ACCESS_TYPES.READ) }
                    canUpdateAgreement={ hasAccess(ENDPOINTS.RECEIPTS_URL, ACCESS_TYPES.WRITE) }
                    history={ this.props.history }
                />
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
        timeIntervals: PropTypes.object,
    };
}
