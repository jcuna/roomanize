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
                                    <Route path="/roles" render={() => <Roles {...props}/>} />
                                    <Route component={ErrorPage} />
                                </Switch>
                            </RequiresLogin>
                        </Switch>
                    </div>
                )
            }}/>
        )
    }
}