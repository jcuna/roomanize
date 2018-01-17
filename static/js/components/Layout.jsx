/**
 * Created by Jon on 6/24/17.
 */

import Menu from './Menu.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Routes from './Routes.jsx';
import {Redirect} from 'react-router'
import {BrowserRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {fetchUser} from '../actions/userActions';
import '../../css/app.scss';
import '../../css/overrides.scss';
import {token} from "../utils/token";
import Spinner from "./Spinner";
import {fetchPermissions} from "../actions/roleActions";
import Overlay from "./Overlay";
import {setStateData} from "../utils/config";

class Layout extends React.Component {

    componentWillMount() {
        if (this.props.user.status === 'pending') {
            this.props.dispatch(fetchUser())
        }
        if (this.permissionsPending()) {
            this.props.dispatch(fetchPermissions())
        }
    }

    permissionsPending() {
        return Object.keys(this.props.roles.permissions).length === 0
    }

    componentWillReceiveProps(props) {
        if (props.token.value !== '') {
            token.data = props;
            setStateData(props);
        }
    }

    render() {
        let render;
        if (this.props.user.status === 'pending' && this.permissionsPending() && this.props.user.status === 'logged_in') {
            render = <Spinner/>
        } else {
            render = <Routes {...this.props}/>
        }

        return (
            <BrowserRouter>
                <div className="parent-container">
                    <Menu {...this.props}/>
                    <div className={this.getClassName()}>
                        <Header {...this.props}/>
                        {render}
                        <Footer/>
                    </div>
                    <Overlay {...this.props}/>
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
        roles: state.roles.roles,
        showMobileMenu: state.app.showMobileMenu,
        notifications: state.app.notifications,
        landingPage: state.app.landingPage,
        overlay: state.app.overlay
    }
};

export default connect(getInitialState)(Layout);