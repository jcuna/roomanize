/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from './user/Login.jsx';
import RequiresLogin from './user/RequiresLogin.jsx';
import FlashMessages from '../utils/Notifications.jsx';
import Menu from './Menu';
import Header from './Header';
import Footer from './Footer';
import Overlay from '../utils/Overlay';
import PropTypes from 'prop-types';
import Routes from './Routes';

export default class Layout extends React.Component {
    render() {
        return (
            <Route render = { props => {
                props = { ...this.props, ...props };
                return (
                    <div>
                        <Menu { ...props }/>
                        <div className={ this.getClassName() }>
                            <Header { ...props }/>
                            <div className='content-area container'>
                                <FlashMessages { ...this.props }/>
                                <Switch>
                                    <Route path='/account/login' render={ () => <Login { ...props }/> }/>
                                    <RequiresLogin { ...props }>
                                        <Routes { ...props }/>
                                    </RequiresLogin>
                                </Switch>
                            </div>
                            <Footer/>
                        </div>
                        <Overlay { ...props }/>
                    </div>
                );
            } }/>
        );
    }

    getClassName() {
        let className = 'body-container';

        if (this.props.showMobileMenu) {
            className += ' body-displaced';
        }
        return className;
    }

    static propTypes = {
        showMobileMenu: PropTypes.bool
    };
}
