/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ALERTS, ENDPOINTS } from '../../constants';
import { notifications } from '../../actions/appActions';
import AgreementForm from './AgreementForm';

export default class AgreementNew extends React.Component {
    constructor(props) {
        super(props);

        if (props.agreements.agreement.tenant.id === null) {
            props.dispatch(notifications({
                type: ALERTS.WARNING, message: 'Seleccione un inquilino antes de proceder',
            }));
            props.history.push(ENDPOINTS.TENANTS_URL);
        }

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            button: { value: 'Crear', disabled: true },
        };
    }

    render() {
        const { agreement } = this.props.agreements;
        return (
            <div>
                <h1>Nuevo Contrato/Registracion</h1>

                <div className="card text-center">
                    <div className="card-header">Inquilino</div>
                    <div className="card-body">
                        <h4 className="card-title">
                            { `${ agreement.tenant.name }` }
                        </h4>
                        <p className='sticky-top'>{ (agreement.tenant.identification_number) }</p>
                    </div>
                </div>
                <AgreementForm { ...this.props } onSubmit={ this.onSubmit } button={ this.state.button }/>
            </div>);
    }

    onSubmit() {

    }

    static propTypes = {
        dispatch: PropTypes.func,
        agreements: PropTypes.object,
        history: PropTypes.object,
    };
}
