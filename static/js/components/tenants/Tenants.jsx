/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../utils/Table';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { getTenants, setSelectedTenant } from '../../actions/tenantsAction';
import Spinner from '../../utils/Spinner';
import { hasAccess } from '../../utils/config';
import FontAwesome from '../../utils/FontAwesome';

export default class Tenants extends React.Component {
    constructor(props) {
        super(props);

        this.search = this.search.bind(this);
        this.createNewTenant = this.createNewTenant.bind(this);
        this.props.dispatch(getTenants(1, 'id'));
    }

    render() {
        const { history, tenants, dispatch } = this.props;
        const canEdit = hasAccess(ENDPOINTS.TENANTS_URL, ACCESS_TYPES.WRITE);

        if (tenants.processing) {
            return <Spinner/>;
        }

        const list = [];
        tenants.data.list.forEach(item => {
            const row = [
                item.first_name + ' ' + item.last_name,
                item.email,
                item.phone,
                item.identification_number,
            ];

            if (canEdit) {
                row.push(<FontAwesome
                    type='user-edit'
                    className='text-info'
                    onClick={ () => {
                        dispatch(setSelectedTenant(item));
                        history.push(`${ ENDPOINTS.TENANTS_URL }/editar/${ item.id }`);
                    } }/>);
            }
            list.push(row);
        });

        const header = ['Nombre', 'Email', 'Telephone', 'Cedula'];
        if (canEdit) {
            header.push('Editar');
        }

        return <div>
            <Breadcrumbs { ...this.props }/>
            <h1>Inquilinos</h1>
            <div className='table-actions'>
                <input
                    placeholder='Buscar'
                    onChange={ this.search }
                    className='form-control'
                />
                <button
                    disabled={ false }
                    onClick={ () => history.push(`${ ENDPOINTS.TENANTS_URL }/nuevo`) }
                    className='btn btn-success'>
                    Nuevo Inquilino
                </button>
            </div>

            <Table headers={ header } rows={ list }/>
        </div>;
    }

    search() {

    }

    createNewTenant() {

    }

    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        tenants: PropTypes.object,
    };
}
