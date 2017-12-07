/**
 * Created by Jon on 12/7/17.
 */

import { logout } from "../../actions/userActions";
import Spinner from "../Spinner";

export default class Logout extends React.Component {

    componentWillMount() {
        if (this.props.user.status === 'logged_in') {
            this.props.dispatch(logout());
        } else {
            this.props.history.push("/");
        }
    }

    render() {
        return <Spinner/>
    }
}