/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/header.scss';
import { toggleMobileMenu } from '../actions/appActions';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleUserMenu = this.toggleUserMenu.bind(this);
        this.state = {
            userNameClass: 'user-menu'
        };
    }

    render() {
        const { user } = this.props;
        const loggedIn = user.status === 'logged_in';

        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="../images/building.png"/></Link>

                    { loggedIn &&
                        <ul className="super-menu">
                            <li className="navPanelToggle" onClick={ this.toggleMenu }>
                                <span className="fas fa-bars"/>
                            </li>
                            <li className="user-icon" onClick={ this.toggleUserMenu }>
                                { this.getUserIcon()}
                            </li>
                        </ul>
                    }
                </div>
                <section id="banner">
                    <h1>Mártires</h1>
                    <p>Contabilidad y manejo de clientes</p>
                </section>
            </header>
        );
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu));
    }

    userMenu() {
        const menu = [
            { name: 'Logout', link: '/logout' }
        ];

        return (
            <div className={ this.state.userNameClass }>
                <ul>
                    { menu.map((a, b) => <li key={ b }><Link to={ a.link }>{ a.name }</Link></li>) }
                </ul>
            </div>
        );
    }

    getUserIcon() {
        const { user } = this.props;

        return (
            <div
                className="user-pic">{ user.pic && <img src={ user.pic }/> || this.getUserInitials() }
                { this.userMenu() }
            </div>
        );
    }

    toggleUserMenu() {
        const extraClass = 'user-menu-display';


        this.setState({
            userNameClass: this.state.userNameClass.includes(extraClass) ?
                'user-menu' : this.state.userNameClass + ' ' + extraClass
        });
    }

    getUserInitials() {
        const { user } = this.props;

        return user.first_name.charAt(0) + user.last_name.charAt(0);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object
    }
}
