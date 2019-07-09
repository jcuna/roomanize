/**
 * Created by Jon on 2019-07-05.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../utils/Table';
import { formatPhone, friendlyDateEs, toLocalTimezone } from '../../utils/helpers';
import '../../../css/receipts/receipt.scss';
import FontAwesome from '../../utils/FontAwesome';
import { ENDPOINTS } from '../../constants';
import Link from 'react-router-dom/es/Link';

export default class Receipt extends React.Component {
    constructor(props) {
        super(props);

        this.email = this.email.bind(this);
    }

    render() {
        const { project, receipt, timeIntervals, paymentTypes, onPrint, id } = this.props;
        const paymentType = paymentTypes.length > 0 &&
            paymentTypes.filter(a => Number(a.id) === Number(receipt.payment_type_id)).pop().type;
        const enteredOn = new Date(receipt.balance.agreement.entered_on);
        const paidDate = new Date(receipt.paid_date);
        toLocalTimezone(enteredOn);
        toLocalTimezone(paidDate);
        // const currentBalance = (Number(receipt.balance.balance) - Number(receipt.amount)).toFixed(2);
        return (
            <div id={ id || receipt.id } className='receipt-wrapper'>
                <section className='widget receipt'>
                    <FontAwesome
                        className='print-button'
                        type='print'
                        data-id={ receipt.id }
                        title='imprimir'
                        onClick={ onPrint }
                    />
                    { receipt.user.email !== '' &&
                        <FontAwesome className='email-button' type='paper-plane' title='email' onClick={ this.email }/> }
                    <div className='header'>
                        <h4>{ project.name }</h4>
                        <small>{ project.address }</small>
                        <br/>
                        <small>{ formatPhone(project.contact) }</small>
                    </div>
                    <span className='divider'/>
                    <h5>Recibo De pago</h5>
                    <span className='divider'/>
                    <Table numberedRows={ false } rows={ [
                        ['# De Recibo', receipt.id],
                        ['Inquilino',
                            <Link
                                to={ `${ ENDPOINTS.TENANTS_URL}/editar/${receipt.user.id }` }
                                key={ receipt.user.phone }>
                                { receipt.user.first_name + ' ' + receipt.user.last_name }
                            </Link>
                        ],
                        ['Telefono', formatPhone(receipt.user.phone)],
                        ['Inquilino Desde', friendlyDateEs(enteredOn)],
                        ['Ciclo De Pago',
                            timeIntervals.length > 0 && timeIntervals.filter(a =>
                                Number(a.id) === Number(receipt.balance.agreement.time_interval_id)).pop().interval
                        ],
                        ['-----------', '-----------'],
                        ['Fecha De Pago', friendlyDateEs(paidDate)],
                        ['Balance Ciclo Anterior', receipt.balance.previous_balance],
                        // ['Balance', receipt.balance.balance],
                        ['Pago en ' + paymentType, receipt.amount],
                        // ['Balance Actual', currentBalance],
                        // currentBalance > 0 && ['Proximo Pago']
                    ] }/>
                </section>
            </div>
        );
    }

    email() {
        console.log('wang go email huh?');
    }

    static propTypes = {
        dispatch: PropTypes.func,
        receipt: PropTypes.object,
        project: PropTypes.object,
        timeIntervals: PropTypes.array,
        paymentTypes: PropTypes.array,
        onPrint: PropTypes.func,
        id: PropTypes.string,
    };
}
