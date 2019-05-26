/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { clearSelectedTenant, createTenant, editTenant, getTenant } from '../../actions/tenantsAction';
import { notifications } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import Spinner from '../../utils/Spinner';

export default class TenantsForm extends React.Component {
    constructor(props) {
        super(props);

        this.formSubmit = this.formSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);

        const tenant_id = this.props.match.params.tenant_id || null;
        const { dispatch } = this.props;

        this.state = {
            notFound: false,
            button: {
                disabled: true,
                className: 'col-6',
                value: tenant_id ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            ...this.props.tenants.selectedTenant
        };

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
    }

    componentWillUnmount() {
        this.props.dispatch(clearSelectedTenant());
    }

    render() {
        return <div>
            <Breadcrumbs { ...this.props } title={ this.state.id ? 'Editar' : 'Nuevo' }/>
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

            <div className='table-actions'>
                <button
                    onClick={ () => history.push(`${ ENDPOINTS.AGREEMENTS_URL }/nuevo`) }
                    className='btn btn-success'>
                    Nueva Registración
                </button>
            </div>

            {
                this.props.tenants.selectedTenant.history.length &&
                TenantsForm.displayTenantHistory(this.props.tenants.selectedTenant.history)
            }
        </div>;
    }

    static displayTenantHistory(history) {
        return <div className="tenant-history">
            <h3>Historial</h3>
            {
                history.map((i, row) => {
                    return (
                        <div key={ i }>
                            <hr/>
                            <h4>References</h4>

                        </div>
                    );
                })
            }

        </div>;
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
                this.props.history.push(`${ENDPOINTS.TENANTS_URL}/editar/${tenant_id}`);
            } else {
                this.props.history.push(ENDPOINTS.TENANTS_URL);
            }
            this.props.dispatch(notifications({
                type: ALERTS.SUCCESS,
                message: `Inquilino ${verb} correctamente`,
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
            button: { ...this.state.button, disabled: !isValid }
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        tenants: PropTypes.object,
        history: PropTypes.object,
    };
}
