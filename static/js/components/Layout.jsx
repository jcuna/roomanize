/**
 * Created by Jon on 6/24/17.
 */


import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Routes from './Routes.jsx';
import { BrowserRouter } from 'react-router-dom';
import '../../css/app.scss';

export default class Layout extends React.Component {
    render() {
        return (
            <div>
                <BrowserRouter>
                    <div>
                        <Header {...this.state}/>
                        <Routes session={this.state}/>
                        <Footer/>
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}