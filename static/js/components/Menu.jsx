/**
 * Created by Jon on 11/22/17.
 */

import {Link} from 'react-router-dom';
import '../../css/menu.scss';

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slide: false
        }
    }

    componentWillReceiveProps(next) {
        if (next.slide !== this.state.slide) {
            this.setState({
                slide: next.slide
            })
        }
    }

    render() {
        let isLoggedIn = false;
        let name = 'jon';
        return (
            <div className={this.className}>
                <i onClick={this.props.toggleMobileMenu} className="fa fa-times" aria-hidden="true"></i>
                <nav id="mobile-nav">
                    {isLoggedIn && <Link to="/new-movie" onClick={this.props.toggleMobileMenu}>Add movie</Link>}
                    <Link to="/find-movie" onClick={this.props.toggleMobileMenu}>Find movies</Link>
                    <Link to="/catalog" onClick={this.props.toggleMobileMenu}>Catalog</Link>
                    <Link to={isLoggedIn ? "/logout": "/login"}  onClick={this.props.toggleMobileMenu}>
                        <span>{isLoggedIn ? `${name}`: "login"}</span>
                        {isLoggedIn && <i className="user-logout fa fa-sign-out"></i>}
                    </Link>
                </nav>
            </div>
        )
    }

    get className() {
        let className = 'mobile-menu';
        if (this.state.slide) {
            className += ' slide'
        }
        return className;
    }
}