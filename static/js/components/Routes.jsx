/**
 * Created by Jon on 11/20/17.
 */

import {Route, Switch} from 'react-router-dom'
import Login from './user/Login.jsx'
import RequiresLogin from './user/RequiresLogin.jsx';
import FlashMessages from './Notifications.jsx'
import ErrorPage from './ErrorPage.jsx';
import Logout from './user/Logout.jsx'
import Home from "./Home";
import Roles from "./user/Roles";
import {hasAccess} from "../utils/config";
import Users from "./user/Users";

export default class Routes extends React.Component {

    render() {
        return (
            <Route render = {props => {
                props = {...this.props, ...props};
                return (
                    <div className="content-area container">
                        <FlashMessages {...this.props}/>
                        <Switch>
                            <Route path="/login" render={() => <Login {...props}/>}/>
                            <RequiresLogin {...props}>
                                <Switch>
                                    <Route exact path="/" render={() => <Home {...props} />}/>
                                    <Route path="/logout" render={() => <Logout {...props}/>} />
                                    <Route path="/roles" render={() => this.getComponent(props, Roles)} />
                                    <Route path="/users" render={() => this.getComponent(props, Users)} />
                                    <Route component={ErrorPage} />
                                </Switch>
                            </RequiresLogin>
                        </Switch>
                    </div>
                );
            }}/>
        )
    }

    getComponent(props, Component) {
        if (hasAccess(props.history.location.pathname)) {
            return <Component {...props}/>;
        }
        return <ErrorPage type={403}/>;
    }
}
