/**
 * Created by Jon on 11/20/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/header.scss';
import { toggleMobileMenu } from '../actions/appActions';
import { API_PREFIX, ENDPOINTS, STATUS } from '../constants';
import { listenRoleChanges } from '../actions/roleActions';
import { listenUserChanges, listenUserNotifications, updateMyUser } from '../actions/userActions';
import FontAwesome from '../utils/FontAwesome';

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleUserMenu = this.toggleUserMenu.bind(this);
        this.state = {
            dispatchedRolesWS: false,
            dispatchedUserWS: false
        };

        this.userMenus = [
            React.createRef(),
            React.createRef(),
        ];
    }

    componentDidUpdate({ clickedContent, appState }) {
        if (this.props.clickedContent !== clickedContent) {
            this.userMenus.forEach((el) => {
                if (el.current === null) {
                    return;
                }
                const child = el.current.querySelector('.dropdown-menu');
                if (child.classList.contains(this.props.showMenuClass)) {
                    child.classList.remove(this.props.showMenuClass);
                    el.current.classList.remove(this.props.menuNipsClass);
                }
            });
        }
        const { user, dispatch } = this.props;

        if (user.status === STATUS.PROCESSED) {
            if (!this.state.dispatchedRolesWS && user.roles.length > 0) {
                this.setState({
                    dispatchedRolesWS: true,
                });
                dispatch(listenRoleChanges(this.getFetchRolesOptions(user)));
            }

            if (!this.state.dispatchedUserWS) {
                this.setState({
                    dispatchedUserWS: true,
                });
                dispatch(listenUserChanges(user.id));
                dispatch(listenUserNotifications(user.id, this.newNotification));
            }
        }
        if (appState === 1 && this.props.appState === 0) {
            window.location.href = `${API_PREFIX}install`;
        }
    }

    newNotification(data) {
        console.log(data);
    }

    getFetchRolesOptions(user) {
        const options = {
            shouldFetch: false,
            roles: []
        };

        user.roles.forEach(r => {
            options.roles.push(r.name);
            if (typeof r.permissions['views.users.Roles'] !== 'undefined' &&
                r.permissions['views.users.Roles'].includes('read')) {
                options.shouldFetch = true;
            }
        });

        return options;
    }

    getSelectedProject({ projects }, { attributes }) {
        let name = 'Roomanize';

        if (typeof attributes.preferences.default_project !== 'undefined') {
            projects.forEach(item => {
                if (Number(item.id) === attributes.preferences.default_project) {
                    name = item.name;
                }
            });
        }
        return name;
    }

    render() {
        const { user, projects } = this.props;
        const loggedIn = user.status === STATUS.PROCESSED;
        const projectName = this.getSelectedProject(projects, user);

        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="/images/building.png"/></Link>

                    { loggedIn &&
                        <ul className="super-menu">
                            { this.userMenu() }
                            { this.getMessagesMenu() }
                            <li className="navPanelToggle" onClick={ this.toggleMenu }>
                                <FontAwesome className='menu-grid' type="th"/>
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

    getMessagesMenu() {
        const { messages: { list, total_unread }} = this.props.user;

        let toggle = this.toggleUserMenu;
        if (list.length === 0) {
            toggle = () => {};
        }

        return <li className='messages-menu' ref={ this.userMenus[1] } onClick={ toggle }>
            <div className='menu-grid'>
                <FontAwesome type='bell'/>
                { total_unread > 0 && <div className='messages-bubble'>
                    <span>{total_unread > 99 ? '99+' : total_unread}</span>
                </div>}
            </div>
            <div className={ this.props.initialClass }>
                <ul>
                    { list.map((a, b) =>
                        <li key={ b }>
                            <Link
                                className={ (!a.read ? 'unread' : 'read') }
                                to={ `${ENDPOINTS.MESSAGES_URL}/${a.id}` }>{ a.subject }
                            </Link>
                        </li>
                    ) }
                </ul>
                <Link className='read read-all' to={ ENDPOINTS.MESSAGES_URL }>Todos los mensajes</Link>
            </div>
        </li>;
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(!this.props.showMobileMenu));
        this.props.dispatch(updateMyUser({
            attributes: {
                preferences: { showMobileMenu: !this.props.showMobileMenu }
            }
        }));
    }

    userMenu() {
        const { user } = this.props;
        const menu = [
            { name: 'Perfil', link: ENDPOINTS.ACCOUNT_PROFILE },
            { name: 'Logout', link: ENDPOINTS.ACCOUNT_LOGOUT }
        ];
        return <li className="user-icon" ref={ this.userMenus[0] } onClick={ this.toggleUserMenu }>
            <div
                className="user-pic">{ user.pic && <img src={ user.pic }/> || this.getUserInitials() }
            </div>
            <div className={ this.props.initialClass }>
                <ul>
                    { menu.map((a, b) => <li key={ b }>
                        <Link to={ a.link }>{ a.name }</Link>
                    </li>) }
                </ul>
            </div>
        </li>;
    }

    toggleUserMenu(e) {
        e.stopPropagation();
        this.userMenus.forEach((el) => {
            const child = el.current.querySelector('.dropdown-menu');
            if (el.current === e.currentTarget) {
                if (child.classList.contains(this.props.showMenuClass)) {
                    el.current.classList.remove(this.props.menuNipsClass);
                    child.classList.remove(this.props.showMenuClass);
                } else {
                    el.current.classList.add(this.props.menuNipsClass);
                    child.classList.add(this.props.showMenuClass);
                }
            } else if (child.classList.contains(this.props.showMenuClass)) {
                el.current.classList.remove(this.props.menuNipsClass);
                child.classList.remove(this.props.showMenuClass);
            }
        });
    }

    getUserInitials() {
        const { user } = this.props;
        return <span>{ user.first_name.charAt(0) + user.last_name.charAt(0) }</span>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object,
        initialClass: PropTypes.string,
        showMenuClass: PropTypes.string,
        menuNipsClass: PropTypes.string,
        clickedContent: PropTypes.bool,
        projects: PropTypes.object,
        history: PropTypes.object,
        appState: PropTypes.number,
    }
}

Header.defaultProps = {
    initialClass: 'dropdown-menu',
    showMenuClass: 'dropdown-menu-display',
    menuNipsClass: 'menu-nips'
};

export default Header;
