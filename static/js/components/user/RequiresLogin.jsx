/**
 * Created by Jon on 12/6/17.
 */

import {flashMessage} from "../../actions/appActions";

export default class RequiresLogin extends React.Component {

    componentWillReceiveProps(next, current) {
        if (next.token === 'expired') {
            this.props.dispatch(flashMessage([
                {type: 'warning', message: "Tienes que iniciar sessión"}
            ]));
            this.props.history.push("/login");
        }
    }

    render() {
        return null;
    }

}