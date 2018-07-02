/**
 * Created by Jon on 12/3/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { login } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';
import { clearLandingPage } from '../../actions/appActions';
import { INVALID_LANDING_PAGES } from '../../constants';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            button: { value: 'Login' }
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
        this.initialRefs = this.initialRefs.bind(this);
    }

    static getDerivedStateFromProps({ history, user, landingPage, dispatch }, state) {
        if (user.status === 'logged_in') {
            if (!INVALID_LANDING_PAGES.includes(landingPage)) {
                history.push(landingPage);
                dispatch(clearLandingPage());
            } else {
                history.push('/');
            }
        }
        return state;
    }

    render() {
        const { user } = this.props;
        const email = user.email || '';
        const password = user.password || '';

        if (user.status === 'logging_in' || user.status === 'logging_out') {
            return <Spinner/>;
        }

        return <FormGenerator { ...{
            formName: 'login-form',
            button: this.state.button,
            elements: [
                { type: 'text', placeholder: 'Email', onChange: this.validateFields, name: 'email', defaultValue: email },
                { type: 'password', placeholder: 'Contraseña', onChange: this.validateFields, name: 'password', defaultValue: password }
            ],
            callback: this.handleSubmit,
            object: this,
            initialRefs: this.initialRefs
        } }/>;
    }

    validateFields() {
        if (this.refs.email.value !== '' && this.refs.password.value !== '') {
            this.setState({
                button: { value: 'Login' }
            });
        } else if (typeof this.state.button.disabled === 'undefined') {
            this.setState({
                button: { value: 'Login', disabled: 'disabled' }
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.dispatch(login(this.refs.email.value, this.refs.password.value));
    }

    initialRefs(refs) {
        if (refs.email.value === '' || refs.password.value === '') {
            this.setState({
                button: { value: 'Login', disabled: 'disabled' }
            });
        }
    }

    static propTypes = {
        history: PropTypes.object,
        user: PropTypes.object,
        landingPage: PropTypes.string,
        dispatch: PropTypes.func,
    }
}
