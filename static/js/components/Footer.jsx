/**
 * Created by Jon on 11/20/17.
 */

import '../../css/footer.scss';

export default class Footer extends React.Component {
    render () {
        return <section className="footer">
            <div className="inner container">
                <div className="container">
                    <p>Created by Jon Cuna</p>
                    <p><a href="mailto:jcuna@joncuna.com">jcuna@joncuna.com</a></p>
                </div>
            </div>
        </section>;
    }
}