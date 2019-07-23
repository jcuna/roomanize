/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { uploadReceipt, validateExpenseToken } from '../../actions/expenseActions';
import { ALERTS, ENDPOINTS } from '../../constants';
import '../../../css/expenses/expense.scss';
import FontAwesome from '../../utils/FontAwesome';
import { ImageCompression } from '../../utils/helpers';
import { notifications } from '../../actions/appActions';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            receipts: [],
            user: '',
            invalid: false,
        };
        this.uploadReceipt = this.uploadReceipt.bind(this);
        this.props.dispatch(
            validateExpenseToken(
                this.props.match.params.token,
                this.props.match.params.expense_id,
                (resp) => this.setState({ user: resp.user }),
                () => {
                    this.setState({ invalid: true });
                    this.props.dispatch(notifications({
                        type: ALERTS.DANGER, message: 'Vinculo no es valido'
                    }));
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
                    { !this.state.invalid && this.getScanInput() }
                </section>
            </div>
        );
    }

    uploadReceipt({ target }) {
        // const file = target.files[0];
        // if (file.size > this.props.max_upload_size) {
        //     const canvas = document.createElement('canvas');
        //     const img = new Image();
        //     img.onload = () => {
        //         const ic = new ImageCompression(canvas, img);
        //         ic.hermiteCompress(300, () => alert('done'));
        //         const w = document.getElementsByClassName('widget')[0];
        //         w.parentNode.insertBefore(canvas, w.nextSibling);
        //     };
        //
        //     img.src = URL.createObjectURL(file);
        // }
        this.props.dispatch(uploadReceipt(
            this.props.match.params.token,
            this.props.match.params.expense_id,
            target.files[0]
        ));
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
        max_upload_size: PropTypes.number,
    };

    static defaultProps = {
        max_upload_size: 500000
    }
}
