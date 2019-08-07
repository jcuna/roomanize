/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { hideOverlay, notifications, showOverlay } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import Table from '../../utils/Table';
import Link from 'react-router-dom/es/Link';
import { updateAgreement } from '../../actions/agreementsAction';
import { formatDateEs, formatPhone } from '../../utils/helpers';
import '../../../css/tenants/tenantform.scss';
import FontAwesome from '../../utils/FontAwesome';
import Button from '../../utils/Button';
import PaymentForm from '../payments/PaymentForm';
import { getTenant } from '../../actions/tenantsAction';

export default class TenantHistory extends React.Component {
    constructor(props) {
        super(props);

        this.confirmEndAgreement = this.confirmEndAgreement.bind(this);
        this.newPayment = this.newPayment.bind(this);
        this.onTerminateContractChange = this.onTerminateContractChange.bind(this);
        this.lastDateInput = React.createRef();

        this.state = {
            lastDate: null,
            notFound: false,
        };
    }

    render() {
        return <div>
            {
                TenantHistory.displayTenantHistory(
                    this.props.selectedTenant.history,
                    this.confirmEndAgreement,
                    this.newPayment,
                    this.props.canProcessPayments,
                    this.props.canUpdateAgreement,
                    this.props.projects.timeIntervals,
                )
            }
        </div>;
    }

    static displayTenantHistory(
        history,
        onFinalize,
        newPayment,
        canProcessPayments,
        canUpdateAgreements,
        timeIntervals
    ) {
        history.sort((a, b) => {
            const aDate = new Date(a.rental_agreement.entered_on);
            const bDate = new Date(b.rental_agreement.entered_on);

            if (aDate > bDate) {
                return -1;
            } else if (aDate < bDate) {
                return 1;
            }
            return 0;
        });

        return <div className="tenant-history">
            <h2>Historial</h2>
            {
                history.map((row, i) => {
                    const items = [];
                    let active = true;

                    if (row.rental_agreement.terminated_on) {
                        active = false;
                        const date = new Date(row.rental_agreement.terminated_on);
                        items.push(['Contrato Terminado en:', date.toDateString()]);
                    } else {
                        const date = new Date(row.rental_agreement.entered_on);
                        items.push(['En vigencia desde', formatDateEs(date)]);
                    }

                    items.push([
                        'No: Habitacion',
                        <Link key={ i }
                            to={ `${ ENDPOINTS.ROOMS_URL }/editar/${ row.rental_agreement.room.id }` }>
                            { row.rental_agreement.room.name }
                        </Link>,
                    ]);

                    items.push(['Referencia I', formatPhone(row.reference1_phone)]);
                    if (row.reference2_phone) {
                        items.push(['Referencia II', formatPhone(row.reference2_phone)]);
                    }

                    if (row.reference3_phone) {
                        items.push(['Referencia III', formatPhone(row.reference3_phone)]);
                    }

                    // balances are sorted in the back end desc by date, so the most recent balance will be at index 0
                    const { balance } = row.rental_agreement;
                    if (active) {
                        if (balance.length > 0) {
                            timeIntervals.length > 0 && items.push([
                                'Ciclo de Pago',
                                timeIntervals.filter(a => a.id === row.rental_agreement.time_interval_id)
                                    .pop().interval
                            ]);

                            let last_payment = 'Nunca';

                            if (balance.length > 0) {
                                if (balance[0].payments.length > 0) {
                                    last_payment = TenantHistory.createLastPaymentComponent(balance[0].payments);
                                } else if (typeof balance[1] !== 'undefined' && balance[1].payments.length > 0) {
                                    last_payment = TenantHistory.createLastPaymentComponent(balance[1].payments);
                                }
                            }
                            let credit = 0;
                            let remaining_balance = Number(balance[0].balance);
                            if (typeof balance[0].payments !== 'undefined') {
                                balance[0].payments.forEach(payment => remaining_balance -= Number(payment.amount));
                            }
                            if (remaining_balance < 0) {
                                credit = Math.abs(remaining_balance);
                                remaining_balance = 0;
                            }

                            const nextPayDate = new Date(balance[0].due_date);
                            const hadPreviousBalance = balance[0].previous_balance > 0;
                            let nextPay = formatDateEs(nextPayDate);
                            if (Number(nextPayDate) < Number(new Date()) ||
                                hadPreviousBalance && remaining_balance > balance[0].previous_balance) {
                                nextPay = <span className='urgent'>Ahora!</span>;
                            }

                            remaining_balance > 0 && items.push(
                                ['Proximo Pago', nextPay]
                            );
                            items.push(['Arrendamiento', `RD$ ${row.rental_agreement.rate}`]);
                            items.push(['Balance', `$RD ${ (remaining_balance.toFixed(2)) }`]);
                            hadPreviousBalance &&
                            items.push([
                                'Deuda',
                                <span
                                    key={ balance[0].previous_balance }
                                    className='urgent'>
                                    $RD ${ balance[0].previous_balance }
                                </span>
                            ]);

                            credit > 0 && items.push(['Credito', `$RD ${ credit }`]);
                            items.push(['Ultimo Pago', last_payment]);
                        }
                    } else {
                        items.push(['Arrendamiento', `RD$ ${row.rental_agreement.rate}`]);
                    }

                    return (
                        <div key={ i }>
                            <Table numberedRows={ false } rows={ items }/>
                            <hr/>
                            { balance.length > 0 && active && <div className='tenant-actions row'>
                                { canProcessPayments &&
                                <div className='col-4'>
                                    <Button
                                        type='info'
                                        key={ row.id + 1 } data-id={ balance[0].id }
                                        value='Efectuar Pago'
                                        size='sm'
                                        onClick={ newPayment }
                                    />
                                </div>
                                }
                                <div className='col-4'>
                                    <Link
                                        className='btn btn-sm btn-success'
                                        key={ row.id + row.tenant_id }
                                        to={ `${ ENDPOINTS.RECEIPTS_URL }/inquilino/${ row.tenant_id }` }>
                                        Ver recibos
                                    </Link>
                                </div>
                                { canUpdateAgreements &&
                                <div className='col-4'>
                                    <Button
                                        type='warning'
                                        size='sm'
                                        key={ row.id }
                                        data-id={ row.id }
                                        onClick={ onFinalize }
                                        value='Terminar contrato'
                                    />
                                </div>
                                }
                            </div> }
                        </div>
                    );
                })
            }
        </div>;
    }

    newPayment({ target }) {
        this.props.dispatch(showOverlay(
            <PaymentForm { ...this.props } target_id={ target.getAttribute('data-id') }/>,
            'Hacer un Pago',
            true
        ));
    }

    onTerminateContractChange(e, validate) {
        if (validate['last-date'].isValid) {
            this.setState({ lastDate: validate['last-date'] });
        }
        if (validate.refund.isValid) {
            this.setState({ refund: validate.refund });
        }
    }

    confirmEndAgreement({ target }) {
        const button = <button
            type='button' onClick={ () => {
                if (!this.state.lastDate.isValid) {
                    this.lastDateInput.current.classList.add('is-invalid');
                } else if (!this.state.refund.isValid) {
                    return;
                } else {
                    const data = {
                        id: target.getAttribute('data-id'),
                        terminated_on: this.state.lastDate.value,
                    };
                    if (typeof this.state.refund !== 'undefined') {
                        data.refund = Number(this.state.refund.value);
                    }
                    this.lastDateInput.current.classList.remove('is-invalid');
                    this.props.dispatch(updateAgreement(data, () => {
                        this.props.dispatch(hideOverlay());
                        this.props.dispatch(getTenant(this.props.match.params.tenant_id));
                        this.props.dispatch(notifications({
                            type: ALERTS.SUCCESS, message: 'Contrato terminado correctamente'
                        }));
                        this.props.dispatch(getTenant(this.props.match.params.tenant_id));
                    }, err => {
                        this.props.dispatch(hideOverlay());
                        this.props.dispatch(notifications({
                            type: ALERTS.DANGER, message: err.resp.error || GENERIC_ERROR
                        }));
                    }));
                }
            } } className='btn btn-warning'>OK</button>;

        this.props.dispatch(showOverlay(
            <div>
                <h4 className='panel'>Estas seguro que deseas finalizar este contrato?</h4>
                <FormGenerator formName='contract-end' elements={ [
                    <small key={ 3 } className=''>Seleccione la fecha de termino. Solo hoy y fechas pasadas.</small>,
                    {
                        name: 'last-date',
                        type: 'date',
                        placeholder: 'Fecha',
                        onChange: this.onTerminateContractChange,
                        validate: ['required'],
                        ref: this.lastDateInput
                    },
                    {
                        name: 'refund',
                        onChange: this.onTerminateContractChange,
                        placeholder: 'Reembolso',
                        validate: ['number']
                    }
                ] }/>
            </div>,
            <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
            true,
            button
        ));
    }

    static createLastPaymentComponent(payments) {
        const by_date = payments.sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
        return (
            <span className='last-payment'>
                <span>{ formatDateEs(new Date(by_date[0].paid_date)) }</span>
                <span className='amount'>{ `($RD ${ by_date[0].amount })` }</span>
            </span>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        selectedTenant: PropTypes.object,
        projects: PropTypes.object,
        timeIntervals: PropTypes.array,
        canProcessPayments: PropTypes.bool,
        canUpdateAgreement: PropTypes.bool,
        history: PropTypes.object,
    };
}
