/**
 * Created by Jon on 11/22/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/menu.scss';
import { clearNotifications, toggleMobileMenu } from '../actions/appActions';
import { hasAccess, routes } from '../utils/config';

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.clearNotifications = this.clearNotifications.bind(this);
    }

    render() {
        return (
            <div className={ this.className }>
                <i onClick={ this.toggleMenu } className="fas fa-times" aria-hidden="true"/>
                <nav id="mobile-nav">
                    {this.getLinksBasedOffAccess()}
                </nav>
            </div>
        );
    }

    get className() {
        let className = 'mobile-menu';

        if (this.props.showMobileMenu) {
            className += ' slide';
        }
        return className;
    }

    getLinksBasedOffAccess() {
        const { roles } = this.props;

        if (Object.keys(roles.permissions).length === 0) {
            return null;
        }

        return routes.map(item => {
            if (hasAccess(item.link, 'read')) {
                return (
                    <Link
                        className={ this.getMenuClass(item) } key={ item.link } to={ item.link }
                        onClick={ this.clearNotifications }>
                        <i className={ item.icon }/>
                        <span>{ item.name }</span>
                    </Link>
                );
            }
            return null;
        });
    }

    clearNotifications() {
        this.props.dispatch(clearNotifications());
    }

    getMenuClass(link) {
        let className = 'menu-item';

        if (this.props.history.location.pathname === link.link) {
            className += ' active';
        }
        return className;
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu));
    }

    static propTypes = {
        user: PropTypes.object,
        roles: PropTypes.object,
        showMobileMenu: PropTypes.bool,
        dispatch: PropTypes.func,
        history: PropTypes.object
    }
}
