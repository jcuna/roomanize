/**
 * Created by Jon on 6/24/17.
 */

import React from 'react';
import Layout from './Layout.jsx';
import { BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/userActions';
import '../../css/app.scss';
import '../../css/overrides.scss';
import { token } from '../utils/token';
import Spinner from '../utils/Spinner';
import { fetchPermissions } from '../actions/roleActions';
import { clickedContent } from '../actions/appActions';
import { setStateData } from '../utils/config';
import PropTypes from 'prop-types';

class App extends React.Component {
    constructor(props) {
        super(props);

        if (props.user.status === 'pending') {
            props.dispatch(fetchUser());
        }
        if (this.permissionsPending()) {
            props.dispatch(fetchPermissions());
        }

        this.clickedContent = this.clickedContent.bind(this);
    }

    permissionsPending() {
        return Object.keys(this.props.roles.permissions).length === 0;
    }

    render() {
        const { props } = this;

        if (props.token.value !== '') {
            token.data = { ...props };
            setStateData({ ...props });
        }

        let render;

        if (props.user.status === 'pending' || this.permissionsPending() &&
            props.user.status === 'logged_in') {
            render = <div className="first-load-spinner"><Spinner/></div>;
        } else {
            render = <Layout { ...props }/>;
        }

        return (
            <BrowserRouter>
                <div className="parent-container" onClick={ this.clickedContent }>
                    { render }
                </div>
            </BrowserRouter>
        );
    }

    clickedContent() {
        this.props.dispatch(clickedContent());
    }

    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object,
        token: PropTypes.object,
        roles: PropTypes.object,
        clickedContent: PropTypes.bool
    };
}

const getInitialState = (state) => {
    return {
        user: state.user.user,
        token: state.user.token,
        roles: state.roles.roles,
        showMobileMenu: state.app.showMobileMenu,
        notifications: state.app.notifications,
        landingPage: state.app.landingPage,
        overlay: state.app.overlay,
        clickedContent: state.app.clickedContent
    };
};

export default connect(getInitialState)(App);
