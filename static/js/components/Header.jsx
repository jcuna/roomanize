/**
 * Created by Jon on 11/20/17.
 */

import {Link} from 'react-router-dom';
import '../../css/header.scss';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: this.props.isLoggedIn,
            user: this.props.user,
            showMobile: false
        };

        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    }

    componentWillReceiveProps(next) {
        this.setState({
            isLoggedIn: next.isLoggedIn,
            user: next.user
        });
    }

    getMobileMenu() {
        let isLoggedIn = this.state.isLoggedIn;
        let name = 'jon' //this.state.user.fname;
        return (
            <div className="mobile-menu">
                <i onClick={this.toggleMobileMenu} className="fa fa-times" aria-hidden="true"></i>
                <nav id="mobile-nav">
                    {isLoggedIn &&
                    <Link to="/new-movie" onClick={this.toggleMobileMenu}>Add movie</Link>
                    }
                    <Link to="/find-movie" onClick={this.toggleMobileMenu}>Find movies</Link>
                    <Link to="/catalog" onClick={this.toggleMobileMenu}>Catalog</Link>
                    <Link to={isLoggedIn ? "/logout": "/login"}  onClick={this.toggleMobileMenu}>
                        <span>{isLoggedIn ? `${name}`: "login"}</span>
                        {isLoggedIn && <i className="user-logout fa fa-sign-out"></i>}
                    </Link>
                </nav>
            </div>
        )
    }

    toggleMobileMenu() {
        this.setState({showMobile: ! this.state.showMobile});
    }

    render () {
        let isLoggedIn = this.state.isLoggedIn;
        let name = 'jon' //this.state.user.fname;
        return (
            <header id="header" className="container">
                { this.state.showMobile && this.getMobileMenu() }
                <div className="inner">
                    <Link to="/" className="logo">Home</Link>
                    <nav id="nav">
                        {isLoggedIn &&
                        <Link to="/new-movie">Add movie</Link>
                        }
                        <Link to="/find-movie">Find movies</Link>
                        <Link to="/catalog">Catalog</Link>
                        <span>|</span>
                        <Link to={isLoggedIn ? "/logout": "/login"}>
                            <span>{isLoggedIn ? `${name}`: "login"}</span>
                            {isLoggedIn && <i className="user-logout fa fa-sign-out"></i>}
                        </Link>
                    </nav>
                    <a className="navPanelToggle" onClick={this.toggleMobileMenu}>
                        <span className="fa fa-bars"></span>
                    </a>
                </div>
                <section id="banner">
                    <h1>Martires</h1>
                    <p>Contabilidad y manejo de clientes</p>
                </section>
            </header>
        );
    }
}