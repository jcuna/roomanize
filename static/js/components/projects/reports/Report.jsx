/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import { fetchReportByUid, setCurrentReport } from '../../../actions/projectActions';
import { STATUS } from '../../../constants';
import Spinner from '../../../utils/Spinner';

export default class Report extends React.Component {
    constructor(props) {
        super(props);
        if (props.projects.currentReport.uid === '') {
            const report = props.projects.reports.filter(item => item.uid === props.projects.currentReport.uid).pop();
            if (report) {
                props.dispatch(setCurrentReport(report));
            } else {
                props.dispatch(fetchReportByUid(props.match.params.report_uid));
            }
        }
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <div className='widget'>
                    <section className='widget-child'>
                        <h2>Report</h2>
                        { this.getRender(this.props) }
                    </section>
                </div>
            </div>
        );
    }

    getRender({ projects }) {
        if (projects.reportsStatus !== STATUS.COMPLETE) {
            return <Spinner/>;
        }

        return <h1>{ projects.currentReport.from_date }</h1>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        match: PropTypes.object,
    };
}
