/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { showOverlay } from '../actions/appActions';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = { name: '' };

        this.props.dispatch(showOverlay(
            <div>
                <h3>What is your name</h3>
                <input type="text" onChange={ ({ target }) => this.setState({ name: target.value }) }/>
            </div>,
        ));
    }

    render() {
        return <h3>Hello { this.state.name }</h3>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
