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
import '../../css/overrides.scss';

class Layout extends React.Component {

    componentWillMount() {
        if (this.props.user.status === 'pending') {
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
        token: state.user.token,
        showMobileMenu: state.app.showMobileMenu,
        notifications: state.app.notifications,
        landingPage: state.app.landingPage
    }
};

export default connect(getInitialState)(Layout);