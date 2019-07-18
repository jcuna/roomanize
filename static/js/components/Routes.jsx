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
import Account from './user/Account';
import RoomForm from './rooms/RoomForm';
import { ACCESS_TYPES, ENDPOINTS } from '../constants';
import Tenants from './tenants/Tenants';
import TenantForm from './tenants/TenantForm';
import AgreementsList from './agreements/AgreementsList';
import AgreementNew from './agreements/AgreementNew';
import AgreementEdit from './agreements/AgreementEdit';
import Receipts from './receipts/Receipts';
import Expenses from './expenses/Expenses';
import ExpenseForm from './expenses/ExpenseForm';

export default class Routes extends React.Component {
    render() {
        const ep = ENDPOINTS;

        return (
            <Switch>
                <Route
                    exact path={ `${ ep.ROOMS_URL }/:action(nuevo|editar)/:room_id([0-9]+)?` }
                    render={ (props) => this.getMiddleware(
                        RequiresProject, RoomForm, ep.ROOMS_URL, props, ACCESS_TYPES.WRITE,
                    ) }
                />

                <Route
                    exact path={ `${ep.ROOMS_URL}/:page([0-9]+)?` }
                    render={ (props) => this.getMiddleware(RequiresProject, Room, ep.ROOMS_URL, props) }
                />

                <Route exact path='/' render={ (props) => this.getComponent(Home, props, true) }/>

                <Route exact path={ ep.ACCOUNT_LOGOUT } render={ props =>
                    this.getComponent(Logout, props, true) }
                />

                <Route exact path={ ep.ROLES_URL } render={ props => this.getComponent(Roles, props) }/>

                <Route exact path={ `${ep.USERS_MANAGER_URL}/:page([0-9]+)?` } render={ props =>
                    this.getComponent(Users, props) }
                />

                <Route exact path={ ep.AGREEMENTS_URL } render={ props => this.getComponent(AgreementsList, props) }/>

                <Route exact path={ `${ ep.AGREEMENTS_URL }/nuevo` }
                    render={ props => this.getComponent(AgreementNew, props) }
                />

                <Route exact path={ `${ ep.AGREEMENTS_URL }/editar/:agreement_id([0-9]+)` }
                    render={ props => this.getComponent(AgreementEdit, props) }
                />

                <Route exact path={ `${ ep.RECEIPTS_URL }/:action(recibo|inquilino)?/:id([0-9]+)?` }
                    render={ (props) => this.getMiddleware(RequiresProject, Receipts, ep.RECEIPTS_URL, props) }
                />

                <Route exact path={ ep.TENANTS_URL } render={ props => this.getComponent(Tenants, props) }/>

                <Route exact path={ `${ep.TENANTS_URL}/:action(nuevo|editar)/:tenant_id([0-9]+)?` }
                    render={ props => this.getComponent(TenantForm, props) }
                />

                <Route exact path={ `${ ep.PROJECTS_URL }/:project_id([0-9]+)?` } render={ props => this.getComponent(
                    Project, props, false, ep.PROJECTS_URL,
                ) }/>

                <Route exact path={ ep.EXPENSES_URL } render={ props => this.getComponent(Expenses, props) }/>

                <Route exact path={ `${ep.EXPENSES_URL}/:action(nuevo|editar)/:expense_id([0-9]+)?` }
                    render={ props => this.getComponent(ExpenseForm, props) }
                />
                <Route exact path={ ep.ACCOUNT_PROFILE } render={ props =>
                    this.getComponent(Account, props, true) }
                />

                <Route path='/error/404' component={ ErrorPage } type={ 404 }/>
                <Route path='/error/403' component={ ErrorPage } type={ 403 }/>
                <Route component={ ErrorPage }/>
            </Switch>
        );
    }

    getComponent(
        Component, { history, ...props }, access = false, path = history.location.pathname,
        accessType = ACCESS_TYPES.READ) {
        if (access || hasAccess(path, accessType)) {
            return <Component { ...this.props } { ...props }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    getMiddleware(Middleware, Component, uri, props, accessType = ACCESS_TYPES.READ) {
        return <Middleware
            component={ Component } { ...this.props } { ...props }
            accessType={ accessType } uri={ uri }
        />;
    }

    static propTypes = {
        history: PropTypes.object,
    };
}
