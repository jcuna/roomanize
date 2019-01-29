/**
 * Created by Jon on 1/1/19.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Logout from './user/Logout';
import Roles from './user/Roles';
import Users from './user/Users';
import Room from './rooms/Room';
import ErrorPage from './ErrorPage';
import { hasAccess } from '../utils/config';
import PropTypes from 'prop-types';
import RequiresProject from './projects/RequiresProject';
import Project from './projects/Project';

export default class Routes extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path='/' render={ (props) => this.getComponent(Home, props, true) }/>
                <Route exact path='/account/logout' render={ props => this.getComponent(Logout, props, true) }/>
                <Route exact path='/roles' render={ props => this.getComponent(Roles, props) }/>
                <Route exact path='/usuarios' render={ props => this.getComponent(Users, props) }/>
                <Route exact path='/contratos' render={ () => (<h1>contratos</h1>) }/>
                <RequiresProject path='/habitaciones' component={ Room } { ...this.props }/>
                <Route exact path='/proyectos/:project_id?' render={ props => this.getComponent(Project, props) }/>
                <Route component={ ErrorPage }/>
            </Switch>
        );
    }

    getComponent(Component, { history, ...props }, access = false) {
        if (access || hasAccess(history.location.pathname)) {
            const finalProps = { ...this.props, ...props };

            return <Component { ...finalProps }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    static propTypes = {
        history: PropTypes.object,
    }
}
