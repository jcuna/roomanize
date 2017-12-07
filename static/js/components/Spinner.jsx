/**
 * Created by Jon on 6/22/17.
 */

import '../../css/spinner.scss';

export default class Spinner extends React.Component {
    render() {
        return <div style={this.getColorStyle()} id="continous-spinner"></div>
    }

    getColorStyle() {
        if (this.props.color !== undefined) {
            return {
                color: this.props.color
            }
        }
    }
}