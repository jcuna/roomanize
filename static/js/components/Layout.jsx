/**
 * Created by Jon on 6/24/17.
 */

import Menu from './Menu.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Routes from './Routes.jsx';
import { BrowserRouter } from 'react-router-dom';
import '../../css/app.scss';

export default class Layout extends React.Component {
    constructor() {
        super();
        this.state = {
            showMobileMenu: false
        };

        this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    }
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Menu slide={this.state.showMobileMenu} toggleMobileMenu={this.toggleMobileMenu}/>
                    <div className={this.getClassName()}>
                        <Header toggleMobileMenu={this.toggleMobileMenu} {...this.state}/>
                        <Routes session={this.state}/>
                        <Footer/>
                    </div>
                </div>
            </BrowserRouter>
        )
    }

    toggleMobileMenu() {
        this.setState({
            showMobileMenu: !this.state.showMobileMenu
        })
    }

    getClassName() {
        let className = 'body-container';
        if (this.state.showMobileMenu) {
            className += ' body-displaced';
        }
        return className
    }
}