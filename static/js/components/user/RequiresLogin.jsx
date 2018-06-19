/**
 * Created by Jon on 12/6/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { setLandingPage, notifications } from '../../actions/appActions';

export default class RequiresLogin extends React.Component {
    constructor(props) {
        super();

        RequiresLogin.makeThemLogin(props);
        this.state = {};
    }

    static getDerivedStateFromProps(nextProps) {
        RequiresLogin.makeThemLogin(nextProps);
        return null;
    }

    static makeThemLogin(props) {
        if (!RequiresLogin.safeStatus.includes(props.user.status)) {
            props.dispatch(notifications([
                { type: 'warning', message: 'Tienes que iniciar sessión' }
            ]));
            props.dispatch(setLandingPage(props.history.location.pathname));
            props.history.push('/login');
        }
    }

    render() {
        return this.props.children;
    }

    static get safeStatus() {
        return [
            'logged_in',
            'logging_in',
            'logging_out'
        ];
    }

    static propTypes = {
        dispatch: PropTypes.func,
        children: PropTypes.object,
        history: PropTypes.object,
    }
}
