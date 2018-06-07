/**
 * Created by Jon on 11/20/17.
 */

import {Link} from 'react-router-dom';
import '../../css/header.scss';
import {toggleMobileMenu} from "../actions/appActions";

export default class Header extends React.Component {
    constructor() {
        super();
        this.toggleMenu = this.toggleMenu.bind(this);
    }

    render () {
        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="../images/building.png"/></Link>
                    <a className="navPanelToggle" onClick={this.toggleMenu}>
                        <span className="fa fa-bars"></span>
                    </a>
                </div>
                <section id="banner">
                    <h1>Mártires</h1>
                    <p>Contabilidad y manejo de clientes</p>
                </section>
            </header>
        );
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu))
    }
}