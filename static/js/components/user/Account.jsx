/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearUserToken, validateUserToken } from '../../actions/userActions';
import { STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import Redirect from 'react-router-dom/es/Redirect';
import { notifications } from '../../actions/appActions';
import FormGenerator from '../../utils/FromGenerator';

export default class Account extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            button: { value: 'Cambiar' }
        };

        const hasToken = typeof props.match.params.user_token !== 'undefined';

        if (hasToken) {
            this.props.dispatch(validateUserToken(props.match.params.user_token));
        }
    }

    render() {
        const { user } = this.props;

        if (user.userToken.status === STATUS.PENDING) {
            return <Spinner/>;
        } else if (user.userToken.status === STATUS.COMPLETE) {
            if (user.status === STATUS.UNPROCESSED && user.userToken.isValid) {
                return this.getForm();
            }
        }
        return <Redirect to="/"/>;
    }

    componentWillUnmount() {
        this.props.dispatch(clearUserToken());
        if (this.props.user.userToken.status === STATUS.COMPLETE &&
            !this.props.user.userToken.isValid) {
            this.props.dispatch(notifications({
                type: 'warning', message: 'El token no es valido o ha expirado'
            }));
        }
    }

    getForm() {
        return (
            <div>
                <h2>Debes crear una contraseña</h2>
                <FormGenerator { ...{
                    formName: 'pw-reset-form',
                    button: this.state.button,
                    elements: [
                        { type: 'password', placeholder: 'Contraseña', onChange: this.validateFields, name: 'password' },
                        { type: 'password', placeholder: 'Repetir Contraseña', onChange: this.validateFields, name: 'password-repeat' }
                    ],
                    callback: this.handleSubmit,
                    object: this,
                    initialRefs: this.initialRefs
                } }/>
            </div>
        );
    }

    validateFields() {

    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        match: PropTypes.object,
    };
}
