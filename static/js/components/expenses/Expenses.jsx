/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { ENDPOINTS } from '../../constants';
import Link from 'react-router-dom/es/Link';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <section className='widget'>
                    <h2>Expenses</h2>
                    <div className='table-actions'>
                        <Link to={ `${ ENDPOINTS.EXPENSES_URL }/nuevo` }>
                            <button
                                disabled={ false }
                                className='btn btn-success'>
                                Agregar gasto
                            </button>
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
