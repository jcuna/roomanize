/**
 * Created by Jon on 12/7/17.
 */

export default class ErrorPage extends React.Component {

    render() {
        return (
            <div className="card">
                <div className="card-header">
                    {this.props.type}
                </div>
                <div className="card-block">
                    <blockquote className="card-blockquote">
                        <p>{this.props.textMap[this.props.type]}</p>
                    </blockquote>
                </div>
            </div>
        )
    }
}

ErrorPage.defaultProps = {
    type: 404,
    textMap: {
        404: 'La página solicitada no existe.',
        403: 'No Tienes accesso al recurso solicitado'
    }
};