/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { notifications } from '../../actions/appActions';
import AgreementForm from './AgreementForm';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { createAgreement } from '../../actions/agreementsAction';
import Link from 'react-router-dom/es/Link';
import { clearRooms } from '../../actions/roomActions';

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
    }

    render() {
        const { agreement } = this.props.agreements;
        return (
            <div>
                <Breadcrumbs { ...this.props } title='Registración'/>
                <section className='widget transparent'>
                    <h2>Nuevo Contrato/Registracion</h2>
                    <div className="card text-center">
                        <div className="card-header">Inquilino</div>
                        <div className="card-body">
                            <h4 className="card-title">
                                <Link to={ `${ ENDPOINTS.TENANTS_URL}/editar/${agreement.tenant.id }` }>
                                    { agreement.tenant.name }
                                </Link>
                            </h4>
                            <p className='sticky-top'>{ (agreement.tenant.identification_number) }</p>
                        </div>
                    </div>
                    <AgreementForm { ...this.props } onSubmit={ this.onSubmit }/>
                </section>
            </div>);
    }

    onSubmit(data) {
        const submissionData = { ...data, tenant_id: this.props.agreements.agreement.tenant.id };
        this.props.dispatch(createAgreement(submissionData, () => {
            this.props.history.push(`${ ENDPOINTS.TENANTS_URL}/editar/${ this.props.agreements.agreement.tenant.id }`);
            this.props.dispatch(notifications({ type: ALERTS.SUCCESS, message: 'Registración completa' }));
            this.props.dispatch(clearRooms());
        }, () => this.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }))));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        agreements: PropTypes.object,
        history: PropTypes.object,
    };
}
