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
    }

    render() {
        return (
            <header id="header">
                <div className="inner">
                    <Link to="/" className="logo"><img src="../images/building.png"/></Link>
                    <a className="navPanelToggle" onClick={ this.toggleMenu }>
                        <span className="fas fa-bars"/>
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
        this.props.dispatch(toggleMobileMenu(this.props.showMobileMenu));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        showMobileMenu: PropTypes.bool
    }
}
