/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearUserToken, logout, updatePassword, validateUserToken } from '../../actions/userActions';
import { ALERTS, ENDPOINTS, STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import { notifications, toggleMobileMenu } from '../../actions/appActions';
import FormGenerator from '../../utils/FromGenerator';
import ErrorPage from '../ErrorPage';

export default class Account extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pw: '',
            pw2: '',
            disabledPW2: true,
            errors: true,
        };

        const hasToken = typeof props.match.params.user_token !== 'undefined';

        if (hasToken) {
            this.props.dispatch(validateUserToken(props.match.params.user_token, () => {
                props.dispatch(toggleMobileMenu(false));
            }, () => this.props.dispatch(
                notifications({
                    type: ALERTS.WARNING,
                    message: 'El token no es valido o ha expirado'
                })))
            );
        }

        this.validateFields = this.validateFields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const { user, match } = this.props;

        if (typeof match.params.user_token !== 'undefined') {
            if (user.userToken.status === STATUS.PENDING) {
                return <Spinner/>;
            } else if (user.userToken.status === STATUS.COMPLETE) {
                if (user.userToken.isValid) {
                    return this.getForm();
                }
            }
        }
        return <ErrorPage type={ 400 }/>;
    }

    componentWillUnmount() {
        this.props.dispatch(clearUserToken());
    }

    getForm() {
        return (
            <div>
                <h2>Crea tu contraseña</h2>
                <div className="card mb-3">
                    <div className="card-header">
                        Usa 6 o más caracteres con una combinación de letras, números y símbolos
                    </div>
                </div>
                <FormGenerator { ...{
                    formName: 'pw-reset-form',
                    button: { value: 'Cambiar', disabled: this.state.errors },
                    elements: [
                        {
                            type: 'password',
                            placeholder: 'Contraseña',
                            onChange: this.validateFields,
                            name: 'password',
                            validate: [
                                'required',
                                'length:6',
                                'regex:^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])'
                            ],
                        },
                        { type: 'password',
                            placeholder:
                                'Repetir Contraseña',
                            onChange: this.validateFields,
                            name: 'password-repeat',
                            disabled: this.state.disabledPW2,
                            validate: [
                                'required',
                                'length:6',
                                'regex:^(?=.*\\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])'
                            ],
                        }
                    ],
                    onSubmit: this.handleSubmit,
                } }/>
            </div>
        );
    }

    validateFields(event, validation) {
        if (validation.password.isValid) {
            this.setState({ pw: validation.password.value, disabledPW2: false });
        }

        if (validation['password-repeat'].isValid &&
            validation['password-repeat'].value === validation.password.value) {
            this.setState({ pw2: validation['password-repeat'].value, errors: false });
        }
    }

    handleSubmit() {
        const { user, match, dispatch, history, updatePasswordError } = this.props;
        dispatch(updatePassword(
            {
                token: match.params.user_token,
                pw: this.state.pw,
                pw2: this.state.pw2
            },
            () => {
                if (user.status === STATUS.PROCESSED) {
                    dispatch(logout());
                }
                history.push(ENDPOINTS.ACCOUNT_LOGIN);
                dispatch(notifications(
                    { type: ALERTS.SUCCESS, message: 'Listo para inicia sesión' })
                );
            },
            () => {
                dispatch(notifications(updatePasswordError));
            }
        ));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        match: PropTypes.object,
        history: PropTypes.object,
        updatePasswordError: PropTypes.object,
    };

    static defaultProps = {
        updatePasswordError: { type: ALERTS.DANGER, message: 'No se pudo guardar el password, trate mas tarde' }
    }
}
