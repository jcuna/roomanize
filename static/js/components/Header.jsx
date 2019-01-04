/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/header.scss';
import { toggleMobileMenu } from '../actions/appActions';
import { STATUS } from '../constants';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleUserMenu = this.toggleUserMenu.bind(this);
        this.state = {
            userNameClass: this.props.initialClass,
        };
    }

    componentDidUpdate({ clickedContent }) {
        if (Header.userMenuIsShowing(this.state.userNameClass) && this.props.clickedContent !== clickedContent) {
            this.hideUserMenu();
        }
    }

    static userMenuIsShowing(userNameClass) {
        return userNameClass.includes(Header.defaultProps.extraClass);
    }

    render() {
        const { user, projects } = this.props;
        const loggedIn = user.status === STATUS.PROCESSED;
        const projectName = projects.selected && projects.selected.name || 'Roomanize';

        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="../images/building.png"/></Link>

                    { loggedIn &&
                        <ul className="super-menu">
                            <li className="user-icon" onClick={ this.toggleUserMenu }>
                                { this.getUserIcon() }
                                { this.userMenu() }
                            </li>
                            <li className="navPanelToggle" onClick={ this.toggleMenu }>
                                <span className="fas fa-bars"/>
                            </li>
                        </ul>
                    }
                </div>
                <section id="banner">
                    <h1>{ projectName }</h1>
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
            { name: 'Perfil', link: '/profile' },
            { name: 'Logout', link: '/logout' }
        ];

        return (
            <div className={ this.state.userNameClass }>
                <ul>
                    { menu.map((a, b) => <li key={ b }><Link to={ a.link }>{ a.name }</Link><hr/></li>) }
                </ul>
            </div>
        );
    }

    getUserIcon() {
        const { user } = this.props;

        return (
            <div
                className="user-pic">{ user.pic && <img src={ user.pic }/> || this.getUserInitials() }
            </div>
        );
    }

    toggleUserMenu(e) {
        e.stopPropagation();
        if (Header.userMenuIsShowing(this.state.userNameClass)) {
            this.hideUserMenu();
        } else {
            this.setState({
                userNameClass: this.props.initialClass + ' ' + this.props.extraClass
            });
        }
    }

    hideUserMenu() {
        this.setState({
            userNameClass: this.props.initialClass
        });
    }

    getUserInitials() {
        const { user } = this.props;

        return user.first_name.charAt(0) + user.last_name.charAt(0);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object,
        initialClass: PropTypes.string,
        extraClass: PropTypes.string,
        clickedContent: PropTypes.bool,
        projects: PropTypes.object
    }
}

Header.defaultProps = {
    initialClass: 'user-menu',
    extraClass: 'user-menu-display'
};

export default Header;
