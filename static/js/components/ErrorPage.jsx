/**
 * Created by Jon on 12/7/17.
 */

export default class ErrorPage extends React.Component {

    render() {
        return (

            <div className="card">
                <div className="card-header">
                    404
                </div>
                <div className="card-block">
                    <blockquote style={{margin: "14px"}} className="card-blockquote">
                        <p>La página solicitada no existe.</p>
                    </blockquote>
                </div>
            </div>
        )
    }
}

