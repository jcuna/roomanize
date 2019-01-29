/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearUserToken, validateUserToken } from '../../actions/userActions';

export default class Account extends React.Component {
    constructor(props) {
        super(props);

        const hasToken = typeof props.match.params.user_token !== 'undefined';

        this.state = { hasToken };

        if (hasToken) {
            this.props.dispatch(validateUserToken(props.match.params.user_token));
        }
    }

    render() {
        const { user } = this.props;

        return <h3>{ user.first_name }</h3>;
    }

    getForm() {

    }

    componentWillUnmount() {
        this.props.dispatch(clearUserToken());
    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        match: PropTypes.object,
    };
}
