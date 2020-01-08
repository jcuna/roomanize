/**
 * Created by Jon on 2019-07-05.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import Spinner from '../../utils/Spinner';
import Paginate from '../../utils/Paginate';
import { getReceipts, searchReceipts } from '../../actions/receiptsActions';
import Receipt from './Receipt';
import { afterPause, generateNonce } from '../../utils/helpers';
import { fetchPaymentTypes, fetchTimeIntervals } from '../../actions/projectActions';

export default class Receipts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search: { key: '', value: '' },
            searching: false,
            page: 1,
            toPrint: { id: 0, nonce: 0 },
        };

        this.fetchData(this.props);

        this.print = this.print.bind(this);
        this.search = this.search.bind(this);

        if (this.props.projects.timeIntervals.length === 0) {
            props.dispatch(fetchTimeIntervals());
        }
        if (this.props.projects.paymentTypes.length === 0) {
            props.dispatch(fetchPaymentTypes());
        }
    }

    fetchData(props) {
        const customSearch = this.state.search.key !== '' && this.state.search.value !== '';
        const byReceipt = props.match.params.action === 'recibo';
        const byUser = props.match.params.action === 'inquilino';
        const byRoom = props.match.params.action === 'habitacion';
        const id = props.match.params.id;

        if (!this.state.searching) {
            if (customSearch) {
                props.dispatch(searchReceipts(
                    this.state.search.key,
                    this.state.search.value,
                    'paid_date',
                    'desc',
                    this.state.page)
                );
            } else if (byReceipt) {
                props.dispatch(searchReceipts('receipt', id, 'paid_date', 'desc', this.state.page));
            } else if (byUser) {
                props.dispatch(searchReceipts('tenant', id, 'paid_date', 'desc', this.state.page));
            } else if (byRoom) {
                props.dispatch(searchReceipts('room', id, 'paid_date', 'desc', this.state.page));
            } else {
                props.dispatch(getReceipts(this.state.page, 'paid_date', 'desc'));
            }
        }
    }

    render() {
        const { receipts } = this.props;
        return <div>
            <Breadcrumbs { ...this.props } title='Recibos'/>
            <div className='widget'>
                <section className='widget-child'>
                    <h1>Recibos</h1>
                </section>
            </div>
            <div className='widget'>
                <section className='widget-child'>
                    <h3>Buscar: # Recibo</h3>
                    <div className='form-row'>
                        <div className='form-group col-md-12'>
                            <input
                                name='receipt'
                                placeholder='Buscar: # Recibo'
                                onChange={ this.search }
                                className='form-control'
                            />
                        </div>
                    </div>
                </section>
                <section className='widget-child'>
                    <h4>Buscar por Fecha</h4>
                    <div className='form-row'>
                        <div className='form-group col-md-12'>
                            <input
                                type='date'
                                name='paid_date'
                                placeholder='Fecha'
                                onChange={ this.search }
                                className='form-control'
                            />
                        </div>
                    </div>
                </section>
            </div>
            { receipts.data.list.map(r =>
                <Receipt
                    key={ r.id }
                    receipt={ r }
                    project={ Receipts.getActiveProject(this.props) }
                    timeIntervals={ this.props.projects.timeIntervals }
                    paymentTypes={ this.props.projects.paymentTypes }
                    dispatch={ this.props.dispatch }
                    id={ this.state.toPrint.id === Number(r.id) && 'printing' || '' }
                    onPrint={ this.print }
                />) }
            { receipts.processing && <Spinner/> }
            {receipts.data.total_pages > 1 &&
            <Paginate total_pages={ receipts.data.total_pages } initialPage={ receipts.data.page }
                onPageChange={ (newPage) => this.setState({ page: newPage }) }
            /> }
        </div>;
    }

    static getActiveProject({ user, projects }) {
        const project_id = user.attributes.preferences.default_project;
        return projects.projects.filter(project => Number(project.id) === project_id).pop();
    }

    search({ target }) {
        if (target.value === '') {
            this.setState({
                search: { key: '', value: '' },
            });
        } else {
            const { dispatch } = this.props;
            afterPause(() => {
                if (target.value.length > 2) {
                    const key = target.getAttribute('name');
                    this.setState({
                        search: { key, value: target.value },
                        page: 1,
                        searching: true,
                    });
                    dispatch(searchReceipts(
                        key, target.value, 'paid_date', 'desc', 1, () => {
                            this.setState({
                                searching: false,
                            });
                        }));
                }
            });
        }
    }

    print({ target }) {
        this.setState({
            toPrint: {
                id: Number(target.getAttribute('data-id')),
                nonce: generateNonce()
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.toPrint.nonce !== this.state.toPrint.nonce) {
            window.print();
        }
        if (prevProps.match.params.id !== this.props.match.params.id ||
            prevProps.match.params.action !== this.props.match.params.action ||
            prevState.page !== this.state.page || prevState.search.value !== this.state.search.value) {
            this.fetchData(this.props);
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        receipts: PropTypes.object,
        roles: PropTypes.object,
        match: PropTypes.object,
        projects: PropTypes.object,
    };
}
