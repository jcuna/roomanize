/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import { notifications } from '../../actions/appActions';
import Route from 'react-router-dom/es/Route';
import Redirect from 'react-router-dom/es/Redirect';
import { hasAccess } from '../../utils/config';
import ErrorPage from '../ErrorPage';

export default class RequiresProject extends React.Component {
    constructor(props) {
        super(props);

        const { projects, dispatch } = props;

        if (projects.selected === null) {
            dispatch(notifications({
                type: 'warning',
                message: 'Debe seleccionar un projecto antes de continuar'
            }));
        }
    }

    render() {
        const { history, projects, ...props } = this.props;

        if (projects.status !== STATUS.COMPLETE) {
            return <Spinner/>;
        } else if (projects.selected === null) {
            return <Redirect to="/proyectos"/>;
        } else if (hasAccess(history.location.pathname)) {
            return <Route { ...props }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    static propTypes = {
        projects: PropTypes.object,
        dispatch: PropTypes.func,
        history: PropTypes.object,
    };
}
