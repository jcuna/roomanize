/**
 * Created by Jon on 11/22/17.
 */

import {Link} from 'react-router-dom';
import '../../css/menu.scss';
import { toggleMobileMenu } from '../actions/appActions'

export default class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.toggleMenu = this.toggleMenu.bind(this);
    }

    render() {
        const { user } = this.props;
        const loggedIn = user.status === 'logged_in';
        return (
            <div className={this.className}>
                <i onClick={this.toggleMenu} className="fa fa-times" aria-hidden="true"></i>
                <nav id="mobile-nav">
                    {this.getLinksBasedOffAccess()}
                    <Link to={loggedIn ? "/logout": "/login"}  onClick={this.toggleMenu}>
                        <span>{loggedIn ? `${user.first_name}`: "login"}</span>
                        {loggedIn && <i className="user-logout fa fa-sign-out"></i>}
                    </Link>
                </nav>
            </div>
        )
    }

    get className() {
        let className = 'mobile-menu';
        if (this.props.showMobileMenu) {
            className += ' slide';
        }
        return className;
    }

    getLinksBasedOffAccess() {
        const routes = [
            {link: "/nueva-habitacion", name: "Agregar habitación"},
            {link: "/editar-habitacion", name: "Ver/Modificar habitación"},
            {link: "/nuevo-contrato", name: "Nuevo Inquilino"}
        ];

        return routes.map(item => <Link key={item.link} to={item.link} onClick={this.toggleMenu}>{item.name}</Link>)
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu))
    }
}