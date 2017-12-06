/**
 * Created by Jon on 12/6/17.
 */

import { clearFlashMessages } from '../actions/appActions';

export default class FlashMessages extends React.Component {

    componentWillReceiveProps(next, current) {
        if (next.flashMessages === this.props.flashMessages) {
            this.props.dispatch(clearFlashMessages());
        }
    }

    render() {
        const { flashMessages } = this.props;
        if (this.props.flashMessages.length !== 0) {
            return flashMessages.map((item, key) => {
                if (item.type === undefined || item.message === undefined) {
                    throw Error('Flash messages should be array of objects with type and message keys');
                } else if (!this.alertTypes.includes(item.type)) {
                    throw Error("invalid message type. Valid types are: " + this.alertTypes.join(", "));
                }
                return (
                    <div key={key} className={`alert alert-${item.type}`} role="alert">
                       {item.message}
                    </div>
                )
            });
        }

        return null;
    }

    get alertTypes() {
        return [
            'success',
            'info',
            'warning',
            'danger'
        ]
    }

}