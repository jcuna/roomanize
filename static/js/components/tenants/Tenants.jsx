/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../utils/Table';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { getTenants, searchTenants, setSelectedTenant } from '../../actions/tenantsAction';
import Spinner from '../../utils/Spinner';
import { hasAccess } from '../../utils/config';
import FontAwesome from '../../utils/FontAwesome';
import Paginate from '../../utils/Paginate';
import { afterPause, searchArray } from '../../utils/helpers';

export default class Tenants extends React.Component {
    constructor(props) {
        super(props);

        this.search = this.search.bind(this);
        this.state = {
            page: this.props.tenants.data.page,
            orderBy: 'id',
            orderDir: 'asc',
            searching: false,
            found: [],
        };
        this.props.dispatch(getTenants(this.props.tenants.data.page, this.state.orderBy, this.state.orderDir));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.page !== this.state.page) {
            this.props.dispatch(getTenants(this.state.page, this.state.orderBy, this.state.orderDir));
        }
    }

    render() {
        const { history, tenants, dispatch } = this.props;
        const canEdit = hasAccess(ENDPOINTS.TENANTS_URL, ACCESS_TYPES.WRITE);
        let data = [];

        if (!tenants.processing && !this.state.searching) {
            data = this.state.found.length > 0 ? this.state.found : tenants.data.list;
        }

        const list = [];
        data.forEach(item => {
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

        const header = ['Nombre', 'Email', 'Telefono', 'Cedula'];
        if (canEdit) {
            header.push('Editar');
        }

        return <div>
            <Breadcrumbs { ...this.props }/>
            <h1>Inquilinos</h1>
            <div className='table-actions'>
                <input
                    placeholder='Buscar: Cedula/Email/Telefono'
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
            { (tenants.processing || this.state.searching) && <Spinner/> }
            <Paginate total_pages={ tenants.data.total_pages } initialPage={ tenants.data.page }
                onPageChange={ (newPage) => this.setState({ page: newPage }) }/>
        </div>;
    }

    search({ target }) {
        if (target.value === '') {
            this.setState({ found: [] });
            this.props.dispatch(getTenants(this.state.page, this.state.orderBy, this.state.orderDir));
        } else {
            const found = searchArray(
                this.props.tenants.data.list, target.value, ['email', 'phone', 'identification_number']
            );
            if (found.length === 0) {
                this.setState({
                    searching: true,
                    found: [],
                });
                afterPause(() => {
                    if (target.value.length > 2) {
                        this.props.dispatch(searchTenants(target.value, () => {
                            this.setState({ searching: false });
                        }));
                    }
                });
            } else {
                this.setState({ searching: false, found });
            }
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        tenants: PropTypes.object,
    };
}
