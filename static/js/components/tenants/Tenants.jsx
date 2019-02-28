/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Tenants extends React.Component {
    render() {
        return <h1>Tenants</h1>;
    }

    static PropTypes = {
        dispatch: PropTypes.func
    };
}
