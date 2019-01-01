/**
 * Created by Jon on 1/1/19.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Logout from './user/Logout';
import Roles from './user/Roles';
import Users from './user/Users';
import NewRoom from './rooms/NewRoom';
import ErrorPage from './ErrorPage';
import { hasAccess } from '../utils/config';
import PropTypes from 'prop-types';

export default class Routes extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path='/' render={ () => <Home { ...this.props } /> }/>
                <Route path='/logout' render={ () => <Logout { ...this.props }/> }/>
                <Route path='/roles' render={ () => this.getComponent(Roles) }/>
                <Route path='/users' render={ () => this.getComponent(Users) }/>
                <Route path='/nueva-habitacion' render={ () => this.getComponent(NewRoom) }/>
                <Route component={ ErrorPage }/>
            </Switch>
        );
    }

    getComponent(Component) {
        if (hasAccess(this.props.history.location.pathname)) {
            return <Component { ...this.props }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    static propTypes = {
        history: PropTypes.object,
    }
}
