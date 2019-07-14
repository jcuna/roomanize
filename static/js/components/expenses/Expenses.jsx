/**
 * Created by Jon on 2019-07-13.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import QRCode from 'qrcode.react';

export default class Expenses extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <section className='widget'>
                    <h2>Expenses</h2>
                    <QRCode value='https://www.google.com'/>
                </section>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
