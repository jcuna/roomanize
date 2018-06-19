/**
 * Created by Jon on 6/22/17.
 *
 * This file bootstraps react and all dependencies to the app tree
 */

import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import { Provider } from 'react-redux';
import Layout from './components/Layout.jsx';
import store from './store';

const bootstrap = () => {
    ReactDOM.render(
        <Provider store={store}>
            <Layout/>
        </Provider>, document.querySelector('#content')
    );
};

bootstrap();

