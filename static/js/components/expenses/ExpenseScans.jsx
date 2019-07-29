/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearExpenses, uploadReceipt, validateExpenseToken } from '../../actions/expenseActions';
import { ALERTS } from '../../constants';
import '../../../css/expenses/expense.scss';
import FontAwesome from '../../utils/FontAwesome';
import { ImageCompression } from '../../utils/ImageCompression';
import { notifications } from '../../actions/appActions';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            receipts: [],
            user: '',
            invalid: false,
            processing: false,
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
                    { this.state.processing && <h1><FontAwesome spin={ true } type={ 'spinner' }/></h1> }
                    { !this.state.invalid && this.getScanInput() }
                </section>
            </div>
        );
    }

    uploadReceipt({ target }) {
        this.setState({ processing: true });
        const file = target.files[0];
        if (file.size > this.props.max_upload_size) {
            const canvas = document.createElement('canvas');
            const img = new Image();

            img.onload = () => {
                const ic = new ImageCompression(canvas, img);
                ic.hermiteCompress(600).then(() => {
                    this.sendFileToServer(canvas.toDataURL(), file.name);
                });
            };
            img.src = URL.createObjectURL(file);
        } else {
            this.sendFileToServer(file, file.name);
        }
    }

    sendFileToServer(file, name) {
        this.props.dispatch(uploadReceipt(
            this.props.match.params.token,
            this.props.match.params.expense_id,
            file, name, () => {
                this.setState({ processing: false });
            }
        ));
    }

    getScanInput() {
        return <div className='scan-button-wrapper'>
            <button><FontAwesome type='upload'/>Escanear</button>
            <input onChange={ this.uploadReceipt } type='file' accept='image/*' capture/>
        </div>;
    }

    componentWillUnmount() {
        this.props.dispatch(clearExpenses());
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
