/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../utils/Table';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { getTenants, searchTenants } from '../../actions/tenantsAction';
import Spinner from '../../utils/Spinner';
import { hasAccess } from '../../utils/config';
import FontAwesome from '../../utils/FontAwesome';
import Paginate from '../../utils/Paginate';
import { afterPause, formatPhone, searchArray } from '../../utils/helpers';
import Link from 'react-router-dom/es/Link';

export default class Tenants extends React.Component {
    constructor(props) {
        super(props);

        this.search = this.search.bind(this);
        this.state = {
            page: this.props.tenants.data.page,
            orderBy: 'updated_on',
            orderDir: 'desc',
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
        const { tenants } = this.props;
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
                formatPhone(item.phone),
                item.identification_number,
            ];

            if (canEdit) {
                row.push(
                    <Link to={ `${ ENDPOINTS.TENANTS_URL }/editar/${ item.id }` }>
                        <FontAwesome
                            type='user-edit'
                            assName='text-info'
                        />
                    </Link>);
            }
            list.push(row);
        });

        const header = ['Nombre', 'Email', 'Telefono', 'Cedula'];
        if (canEdit) {
            header.push('Editar');
        }

        return <div>
            <Breadcrumbs { ...this.props } title='Inquilinos'/>
            <section className='widget'>
                <h1>Inquilinos</h1>
                <div className='table-actions'>
                    <input
                        placeholder='Buscar: Cedula/Email/Telefono'
                        onChange={ this.search }
                        className='form-control'
                    />
                    <Link to={ `${ ENDPOINTS.TENANTS_URL }/nuevo` }>
                        <button
                            disabled={ false }
                            className='btn btn-success'>
                            Nuevo Inquilino
                        </button>
                    </Link>
                </div>
                <Table headers={ header } rows={ list }/>
                { (tenants.processing || this.state.searching) && <Spinner/> }
                {tenants.data.total_pages > 1 &&
                <Paginate total_pages={ tenants.data.total_pages } initialPage={ tenants.data.page }
                    onPageChange={ (newPage) => this.setState({ page: newPage }) }
                /> }
            </section>
        </div>;
    }

    search({ target }) {
        if (target.value === '') {
            this.setState({ found: [] });
            this.props.dispatch(getTenants(this.state.page, this.state.orderBy, this.state.orderDir));
        } else {
            const found = searchArray(
                this.props.tenants.data.list, target.value, ['email', 'phone', 'identification_number'],
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
