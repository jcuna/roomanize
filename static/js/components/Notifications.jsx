/**
 * Created by Jon on 12/6/17.
 */

import {clearNotifications} from '../actions/appActions';

export default class Notifications extends React.Component {

    componentWillReceiveProps(next) {
        if (next.notifications === this.props.notifications) {
            this.props.dispatch(clearNotifications());
        }
    }

    render() {
        const {notifications} = this.props;
        if (this.props.notifications.length !== 0) {
            return notifications.map((item, key) => {
                if (item.type === undefined || item.message === undefined) {
                    throw Error('Flash messages should be array of objects with type and message keys');
                } else if (!Notifications.alertTypes.includes(item.type)) {
                    throw Error("invalid message type. Valid types are: " + Notifications.alertTypes.join(", "));
                }
                return (
                    <div key={key} className={`alert alert-${item.type}`} role="alert">
                        <i className="fas fa-times" aria-hidden="true" onClick={
                            () => this.props.dispatch(clearNotifications())
                        }>{}</i>
                       {item.message}
                    </div>
                )
            });
        }

        return null;
    }

    static get alertTypes() {
        return [
            'success',
            'info',
            'warning',
            'danger'
        ]
    }

}