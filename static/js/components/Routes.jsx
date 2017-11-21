/**
 * Created by Jon on 11/20/17.
 */

import { Route, Switch} from 'react-router-dom'
// import Home from './Home.jsx'
// import ErrorPage from './ErrorPage.jsx';
// import Login from './session/Login.jsx'
// import Logout from './session/Logout.jsx'
// import RequiresLogin from './session/RequiresLogin.jsx';

export default class Routes extends React.Component {
    render() {
        return (
            <Route render={(props) => (
                <div className="content-area container">
                    <Switch>
                        {/*<Route exact path="/" component={Home}/>*/}
                        {/*<Route path="/login" render={() => <Login session={this.props.session} history={props.history}/>}/>*/}
                        {/*<RequiresLogin {...this.props.session} {...props}>*/}
                            {/*<Route exact path="/logout" component={Logout}/>*/}
                        {/*</RequiresLogin>*/}
                        {/*<Route component={ErrorPage}/>*/}
                    </Switch>
                </div>
            )} />
        )
    }
}