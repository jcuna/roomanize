/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import { currentReportClear, fetchReportByUid } from '../../../actions/projectActions';
import Spinner from '../../../utils/Spinner';
import Table from '../../../utils/Table';
import { formatDateEs } from '../../../utils/helpers';

export default class Report extends React.Component {
    constructor(props) {
        super(props);
        if (props.projects.currentReport.project_id === '') {
            props.dispatch(fetchReportByUid(props.match.params.report_uid));
        }
    }

    render() {
        return (
            <div>
                <Breadcrumbs
                    { ...this.props }
                    title='Reporte Mensual'
                    paramValues={ [this.props.projects.currentReport.project_id] }
                    paramNames={ [this.props.projects.currentReport.project] }
                />
                <div className='monthly-report'>
                    <section className='report-body'>
                        { this.getRender(this.props) }
                    </section>
                </div>
            </div>
        );
    }

    getRender({ projects: { currentReport }}) {
        if (currentReport.project_id === '') {
            return <Spinner/>;
        }

        return (
            <div>
                <section className='report-header'>
                    <h1>{currentReport.project}</h1>
                    <p>{currentReport.address}</p>
                </section>
                <section className='period'>
                    <p className='label'>Periodo</p>
                    <p className='value'>{`${currentReport.from_date} - ${currentReport.to_date}`}</p>
                    <p className='label'>Fecha de reporte</p>
                    <p className='value'>{ currentReport.report_day }</p>
                </section>
                <section>
                    <h3>Gastos Totales</h3>
                    <p>{currentReport.total_expenses}</p>
                </section>
                <section>
                    <h3>Pagos Totales</h3>
                    <p>{currentReport.total_income}</p>
                </section>
                <section>
                    <h3>Ganancias Totales</h3>
                    <p>{currentReport.revenue}</p>
                </section>
                <section className='expense-details'>
                    <h4>Detalles de gastos</h4>
                    <Table
                        headers={ ['Descipción', 'Cantidad', 'Fecha'] }
                        rows={ currentReport.expenses.map(ex =>
                            [ex.description, ex.amount, formatDateEs(new Date(ex.expense_date))]
                        ) }
                    />
                </section>
                <section className='expense-details'>
                    <h4>Detalles de pagos</h4>
                    <Table
                        headers={ ['Habitación', 'Cantidad', 'Fecha'] }
                        rows={ currentReport.income.map(inc =>
                            [inc.balance.agreement.room.name, inc.amount, formatDateEs(new Date(inc.paid_date))]
                        ) }
                    />
                </section>
            </div>
        );
    }

    componentWillUnmount() {
        this.props.dispatch(currentReportClear());
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        match: PropTypes.object,
    };
}
