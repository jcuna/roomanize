/**
 * Created by Jon on 2019-05-14.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Table = (props) => {
    return <table className='table table-striped'>
        <thead>
            <tr>
                <th>#</th>
                { Table.getHeaders(props.headers) }
            </tr>
        </thead>
        <tbody>
            { Table.getBody(props.rows) }
        </tbody>
    </table>;
};

Table.getHeaders = (input) => {
    return input.map((item, i) => <th key={ i }>{ item }</th>);
};

Table.getBody = (input) => {
    return input.map((row, i) => <tr key={ i }>
        <th scope='row'>{ i + 1 }</th>
        { Array.isArray(row) && row.map((cell, ix) => <td key={ ix }>{ cell }</td>) ||
            Object.values(row).map((cell, ix) => <td key={ ix }>{ cell }</td>) }
    </tr>);
};

Table.propTypes = {
    headers: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
};

export default Table;
