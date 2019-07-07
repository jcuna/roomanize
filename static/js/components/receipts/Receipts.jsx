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

export default class Receipts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search: { key: '', value: '' },
            page: 1,
            toPrint: { id: 0, nonce: 0 },
        };

        this.fetchData(this.props);

        this.print = this.print.bind(this);
        this.search = this.search.bind(this);
    }

    fetchData(props) {
        const customSearch = this.state.search.key !== '' && this.state.search.value !== '';
        const byReceipt = props.match.params.action === 'recibo';
        const byUser = props.match.params.action === 'inquilino';
        const id = props.match.params.id;

        if (customSearch) {
            props.dispatch(searchReceipts(this.state.search.key, id, this.state.search.value, 'desc', this.state.page));
        } else if (byReceipt) {
            props.dispatch(searchReceipts('receipt', id, 'paid_date', 'desc', this.state.page));
        } else if (byUser) {
            props.dispatch(searchReceipts('tenant', id, 'paid_date', 'desc', this.state.page));
        } else {
            props.dispatch(getReceipts(this.state.page, 'paid_date', 'desc'));
        }
    }

    render() {
        const { receipts } = this.props;
        return <div>
            <Breadcrumbs { ...this.props } title='Recibos'/>
            <section className='widget'>
                <h1>Recibos</h1>
                <div className='table-actions'>
                    <input
                        placeholder='Buscar: # Recibo/Fecha'
                        onChange={ this.search }
                        className='form-control'
                    />
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
            </section>
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
            this.fetchData(this.props);
        } else {
            const { dispatch } = this.props;
            afterPause(() => {
                if (target.value.length > 2) {
                    if (isNaN(target.value)) {
                        this.setState({
                            search: { key: 'paid_date', value: target.value },
                            page: 1,
                        });
                        dispatch(searchReceipts(
                            'paid_date', target.value, 'paid_date', 'desc', 1));
                    } else {
                        dispatch(searchReceipts('receipt', target.value, 'paid_date', 'desc', 1));
                    }
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
