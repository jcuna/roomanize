/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import { Link } from 'react-router-dom';
import { getExpenses } from '../../actions/expenseActions';
import Spinner from '../../utils/Spinner';
import Table from '../../utils/Table';
import FontAwesome from '../../utils/FontAwesome';
import { hasAccess } from '../../utils/config';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1,
            total_pages: 1,
        };
        if (this.props.expenses.data.list.length === 0) {
            this.props.dispatch(getExpenses(this.state.page));
        }
    }

    componentDidUpdate({ expenses }) {
        if (this.props.expenses.data.list.length < expenses.data.list.length) {
            this.props.dispatch(getExpenses(this.state.page));
        }
    }

    render() {
        const { expenses } = this.props;
        const canWrite = hasAccess(ENDPOINTS.EXPENSES_URL, ACCESS_TYPES.WRITE);
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <div className='widget'>
                    <section className='widget-child'>
                        <h2>Gastos</h2>
                        { canWrite && <div className='table-actions'>
                            <Link to={ `${ ENDPOINTS.EXPENSES_URL }/nuevo` }>
                                <button
                                    disabled={ false }
                                    className='btn btn-success'>
                                    Agregar gasto
                                </button>
                            </Link>
                        </div> }
                        { this.getExpenses(expenses) }
                    </section>
                </div>
            </div>
        );
    }

    getExpenses({ data, processing }) {
        if (processing) {
            return <Spinner/>;
        }

        data = this.formatRows(data);

        return <Table
            rows={ data.rows }
            headers={ data.headers }
            numberedRows={ false }
        />;
    }

    formatRows({ list }) {
        const canView = hasAccess(ENDPOINTS.EXPENSES_URL, ACCESS_TYPES.READ);
        const rows = list.map((a, k) => {
            const row = [a.amount, a.description, a.input_date];
            if (canView) {
                row.push(<Link key={ k } to={ `${ENDPOINTS.EXPENSES_URL}/editar/${ a.id }` }>
                    <FontAwesome type='edit'/>
                </Link>);
            }
            return row;
        });
        const headers = ['Monto', 'Descripción', 'Fecha'];
        if (canView) {
            headers.push('Info');
        }
        return {
            rows,
            headers,
        };
    }

    static propTypes = {
        dispatch: PropTypes.func,
        expenses: PropTypes.object,
    };
}
