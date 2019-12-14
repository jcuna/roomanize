/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { hideOverlay, notifications, showOverlay } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import Table from '../../utils/Table';
import { Link } from 'react-router-dom';
import { updateAgreement } from '../../actions/agreementsAction';
import { formatDateEs, formatDecimal, formatPhone } from '../../utils/helpers';
import '../../../css/tenants/tenantform.scss';
import FontAwesome from '../../utils/FontAwesome';
import Button from '../../utils/Button';
import PaymentForm from '../payments/PaymentForm';
import { getTenant } from '../../actions/tenantsAction';
import { clearRooms } from '../../actions/roomActions';

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
                    const date = new Date(row.rental_agreement.entered_on);

                    if (row.rental_agreement.terminated_on) {
                        active = false;
                        const end_date = new Date(row.rental_agreement.terminated_on);
                        items.push(['Contrato iniciado:', formatDateEs(date)]);
                        items.push(['Contrato Terminado:', formatDateEs(end_date)]);
                    } else {
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

                    const { balance, last_payment } = row.rental_agreement;
                    timeIntervals.length > 0 && items.push([
                        'Ciclo de Pago',
                        timeIntervals.filter(a => a.id === row.rental_agreement.time_interval_id)
                            .pop().interval
                    ]);
                    if (balance.length > 0) {
                        const last_pay = last_payment ? TenantHistory.createLastPaymentComponent(last_payment) :
                            'Nunca';

                        let credit = 0;
                        let remaining_balance = Number(balance[0].balance);
                        let payments = 0;
                        balance[0].payments.forEach(payment => payments += Number(payment.amount));
                        remaining_balance -= payments;
                        if (remaining_balance < 0) {
                            credit = Math.abs(remaining_balance);
                            remaining_balance = 0;
                        }

                        const nextPayDate = new Date(balance[0].due_date);
                        const hadPreviousBalance = Number(balance[0].previous_balance) > 0 &&
                            remaining_balance > Number(row.rental_agreement.rate);
                        let nextPay = <span className='success'>{ formatDateEs(nextPayDate) }</span>;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (Number(nextPayDate) < Number(today)) {
                            nextPay = <span className='urgent'>{ formatDateEs(nextPayDate) } - (Atrasado)</span>;
                        }

                        active && remaining_balance > 0 && items.push(
                            ['Proximo Pago', nextPay]
                        );
                        items.push(['Arrendamiento', `RD$ ${row.rental_agreement.rate}`]);
                        items.push(['Balance', `$RD ${(remaining_balance.toFixed(2))}`]);
                        hadPreviousBalance &&
                        items.push([
                            'Deuda',
                            <span
                                key={ balance[0].previous_balance }
                                className='urgent'>
                                $RD ${ (Number(balance[0].previous_balance) - payments).toFixed(2) }
                            </span>
                        ]);

                        credit > 0 && items.push(['Credito', `$RD ${ credit }`]);
                        items.push(['Ultimo Pago', last_pay]);
                    }

                    return (
                        <div key={ i }>
                            <Table numberedRows={ false } rows={ items }/>
                            <hr/>
                            { balance.length > 0 && active && <div className='tenant-actions row'>
                                { canProcessPayments &&
                                <div className='col-6'>
                                    <Button
                                        type='info'
                                        key={ row.id + 1 } data-id={ balance[0].id }
                                        value='Efectuar Pago'
                                        size='sm'
                                        onClick={ newPayment }
                                    />
                                </div>
                                }
                                { canUpdateAgreements &&
                                <div className='col-6'>
                                    <Button
                                        type='warning'
                                        size='sm'
                                        key={ row.id }
                                        data-id={ row.rental_agreement.id }
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

        if (e.target.getAttribute('name') === 'refund') {
            formatDecimal(e);
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
                        this.props.dispatch(clearRooms());
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

    static createLastPaymentComponent(lastPayment) {
        return (
            <span className='last-payment'>
                <span>{ formatDateEs(new Date(lastPayment.date)) }</span>
                <span className='amount'>{ `($RD ${ lastPayment.amount })` }</span>
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
