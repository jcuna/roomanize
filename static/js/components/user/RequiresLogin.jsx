/**
 * Created by Jon on 12/6/17.
 */

import {setLandingPage, notifications} from "../../actions/appActions";

export default class RequiresLogin extends React.Component {

    componentWillReceiveProps(next) {
        this.makeThemLogin(next);
    }

    componentWillMount() {
        this.makeThemLogin(this.props);
    }

    makeThemLogin(props) {
        if (! this.safeStatus.includes(props.user.status)) {
            this.props.dispatch(notifications([
                {type: 'warning', message: "Tienes que iniciar sessión"}
            ]));
            this.props.dispatch(setLandingPage(this.props.history.location.pathname));
            this.props.history.push("/login");
        }
    }

    render() {
        return this.props.children;
    }

    get safeStatus() {
        return [
            'logged_in',
            'logging_in',
            'logging_out'
        ]
    }
}