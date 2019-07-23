/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { uploadReceipt, validateExpenseToken } from '../../actions/expenseActions';
import { ENDPOINTS } from '../../constants';
import '../../../css/expenses/expense.scss';
import FontAwesome from '../../utils/FontAwesome';

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
                (resp) => this.setState({ user: resp.user }),
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
                    <h4 className='scan-user'>{ this.state.user }</h4>
                    { this.getUploadedReceipts() }
                    { this.getScanInput() }
                </section>
            </div>
        );
    }

    uploadReceipt({ target }) {
        this.props.dispatch(uploadReceipt(
            this.props.match.params.token,
            this.props.match.params.expense_id,
            target.files[0]
        ));
    }

    getUploadedReceipts() {
        return this.state.receipts.map((pic, i) =>
            <img key={ i } src={ pic } alt='recibo' className='receipt-scan'/>);
    }

    getScanInput() {
        return <div className='scan-button-wrapper'>
            <button><FontAwesome type='upload'/>Escanear</button>
            <input onChange={ this.uploadReceipt } type='file' accept='image/*' capture/>
        </div>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        history: PropTypes.object,
    };
}
