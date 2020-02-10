/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import { currentReportClear, download_report, fetchReportByUid } from '../../../actions/projectActions';
import Spinner from '../../../utils/Spinner';
import Table from '../../../utils/Table';
import { formatDateEs, numberWithCommas } from '../../../utils/helpers';
import '../../../../css/projects/reports/report.scss';
import FontAwesome from '../../../utils/FontAwesome';

export default class Report extends React.Component {
    constructor(props) {
        super(props);
        if (props.projects.currentReport.project_id === '') {
            props.dispatch(fetchReportByUid(props.match.params.report_uid));
        }
        this.download = this.download.bind(this);
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
                    <section className='report-actions'>
                        <FontAwesome
                            className='print-button'
                            type='print'
                            title='Imprimir'
                            onClick={ window.print }
                        />
                        <FontAwesome
                            className='download-button'
                            type='download'
                            title='Descargar'
                            onClick={ this.download }
                        />
                    </section>
                    { this.getRender(this.props) }
                </div>
            </div>
        );
    }

    download() {
        let styles = '';
        document.querySelectorAll('style').forEach(style => styles += `<style>${style.innerHTML}</style>`);
        let html = '<div class="monthly-report"><div class="report-body">';
        html += document.querySelector('.report-body').innerHTML;
        html += '</div></div>';
        this.props.dispatch(download_report(this.props.match.params.report_uid, html, styles));
    }

    getRender({ projects: { currentReport }}) {
        if (currentReport.project_id === '') {
            return <Spinner/>;
        }

        return (
            <div className='report-body'>
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
                <section className='overview'>
                    <ul>
                        <li>
                            <h5>Gastos Totales</h5>
                            <p>RD$ {numberWithCommas(currentReport.total_expenses)}</p>
                            <hr/>
                        </li>
                        <li>
                            <h5>Pagos Totales</h5>
                            <p>RD$ {numberWithCommas(currentReport.total_income)}</p>
                            <hr/>
                        </li>
                        <li>
                            <h5>Ganancias Totales</h5>
                            <p>RD$ {numberWithCommas(currentReport.revenue)}</p>
                        </li>
                    </ul>
                </section>
                <section className='expense-details'>
                    <h4>Detalles de gastos</h4>
                    <Table
                        headers={ ['Descipción', 'Cantidad', 'Fecha'] }
                        rows={ currentReport.expenses.map(ex =>
                            [ex.description, `RD$ ${numberWithCommas(ex.amount)}`, formatDateEs(new Date(ex.expense_date))]
                        ) }
                    />
                </section>
                <section className='expense-details'>
                    <h4>Detalles de pagos</h4>
                    <Table
                        headers={ ['Habitación', 'Cantidad', 'Fecha'] }
                        rows={ this.getReportRows(currentReport.income) }
                    />
                </section>
            </div>
        );
    }

    getReportRows(income) {
        let t = income.map(inc =>
            [
                inc.balance.agreement.room.name,
                `RD$ ${numberWithCommas(inc.amount)}`,
                formatDateEs(new Date(inc.paid_date))
            ]
        );
        t = t.concat(income.map(inc =>
            [
                inc.balance.agreement.room.name,
                `RD$ ${numberWithCommas(inc.amount)}`,
                formatDateEs(new Date(inc.paid_date))
            ]
        ));
        return t;
    }

    componentWillUnmount() {
        // this.props.dispatch(currentReportClear());
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        match: PropTypes.object,
    };
}
