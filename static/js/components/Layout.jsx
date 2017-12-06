/**
 * Created by Jon on 6/24/17.
 */

import Menu from './Menu.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Routes from './Routes.jsx';
import { Redirect } from 'react-router'
import { BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { getUser } from '../actions/userActions';
import '../../css/app.scss';

class Layout extends React.Component {

    componentWillMount() {
        if (!this.props.loggedIn && this.props.token !== 'expired') {
            this.props.dispatch(getUser())
        }
    }

    render() {
        return (
            <BrowserRouter>
                <div>
                    <Menu {...this.props}/>
                    <div className={this.getClassName()}>
                        <Header {...this.props}/>
                        <Routes {...this.props}/>
                        <Footer/>
                    </div>
                </div>
            </BrowserRouter>
        )
    }

    getClassName() {
        let className = 'body-container';
        if (this.props.showMobileMenu) {
            className += ' body-displaced';
        }
        return className
    }
}

const getInitialState = (state) => {
    return {
        user: state.user.user,
        loggedIn: state.user.loggedIn,
        token: state.user.token,
        showMobileMenu: state.app.showMobileMenu,
        flashMessages: state.app.flashMessages
    }
};

export default connect(getInitialState)(Layout);