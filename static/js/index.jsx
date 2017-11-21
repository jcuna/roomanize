/**
 * Created by Jon on 6/22/17.
 *
 * This file bootstraps react and all dependencies to the app tree
 */

const ReactDOM = require('react-dom');

require('babel-polyfill');
require('whatwg-fetch');

import Layout from './components/Layout.jsx'

class Bootstrap {
    constructor() {
        ReactDOM.render(<Layout/>, document.querySelector('#content'));
    }
}

new Bootstrap();