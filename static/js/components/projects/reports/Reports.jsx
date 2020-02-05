/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import { clearProjectEditing, editProject, fetchReports } from '../../../actions/projectActions';
import { ENDPOINTS, STATUS } from '../../../constants';
import Project from '../Project';
import Spinner from '../../../utils/Spinner';
import Table from '../../../utils/Table';
import { Link, Redirect } from 'react-router-dom';

export default class Reports extends React.Component {
    constructor(props) {
        super(props);

        if (typeof props.match.params.project_id !== 'undefined' && props.projects.status === STATUS.COMPLETE) {
            const project = Project.getEditingProject(props);

            if (project) {
                props.dispatch(editProject(project));
            }
        }
    }

    componentDidUpdate({ projects: { editing }}) {
        const { projects, dispatch } = this.props;
        if (editing.id !== projects.editing.id && projects.editing.id !== '') {
            dispatch(fetchReports(projects.editing.id));
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearProjectEditing());
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props } title={ this.props.projects.editing.name }/>
                <div className='widget'>
                    <section className='widget-child'>
                        <h2>Reports</h2>
                        { this.getRender(this.props) }
                    </section>
                </div>
            </div>
        );
    }

    getRender({ projects, match }) {
        if (typeof match.params.project_id === 'undefined') {
            return <Redirect to={ ENDPOINTS.PROJECTS_URL }/>;
        } else if (projects.reportsStatus === STATUS.COMPLETE) {
            return <Table
                headers={ ['Proyecto', 'Fecha'] }
                rows={ this.props.projects.reports.map(report => [
                    projects.editing.name,
                    <Link
                        key={ report.uid }
                        to={ `${ENDPOINTS.REPORTS_URL}/${projects.editing.id}/${report.project_id}-${report.from_date}` }>
                        {report.from_date}
                    </Link>
                ]) }/>;
        }
        return <Spinner/>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        match: PropTypes.object,
    };
}
