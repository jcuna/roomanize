/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { validateExpenseToken } from '../../actions/expenseActions';
import { ENDPOINTS } from '../../constants';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            receipts: [],
            user: ''
        };
        this.uploadReceipt = this.uploadReceipt.bind(this);
        this.props.dispatch(
            validateExpenseToken(
                this.props.match.params.token,
                this.props.match.params.expense_id,
                null,
                () => {
                    this.props.history.push(ENDPOINTS.NOT_FOUND);
                }
            )
        );
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h2>Escaneo de Recibos</h2>
                    { this.getUploadedReceipts() }
                    { this.getScanInput() }
                </section>
            </div>
        );
    }

    uploadReceipt(e) {
        console.log(e);
    }

    getUploadedReceipts() {
        return this.state.receipts.map((pic, i) =>
            <img key={ i } src={ pic } alt='recibo' className='receipt-scan'/>);
    }

    getScanInput() {
        return <div className='scan-button'>
            <input onChange={ this.uploadReceipt } className='btn btn-success' type='file' accept='image/*' capture/>
        </div>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        history: PropTypes.object,
    };
}
