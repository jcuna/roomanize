/**
 * Created by Jon on 11/20/17.
 */

import {Link} from 'react-router-dom';
import '../../css/header.scss';

export default class Header extends React.Component {

    render () {
        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="../images/building.png"/></Link>
                    <a className="navPanelToggle" onClick={this.props.toggleMobileMenu}>
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
}