/**
 * Created by Jon on 12/3/17.
 */
import FormGenerator from "../../utils/FromGenerator";
import { login } from "../../actions/userActions";
import Spinner from "../Spinner";

export default class Login extends React.Component {

    constructor() {
        super();

        this.state = {
            button: {value: 'Login'}
        };

        this.validateFields = this.validateFields.bind(this);
        this.initialRefs = this.initialRefs.bind(this);
    }

    componentWillReceiveProps(next, current) {
        const {history} = this.props;
        if (next.user.status === 'logged_in') {
            if (this.props.landingPage !== "" && this.props.landingPage !== '/logout') {
                history.push(this.props.landingPage)
            } else {
                history.push("/")
            }
        }
    }

    render() {
        let {user} = this.props;
        let email = user.email || '';
        let password = user.password || '';

        if (user.status === 'logging_in' || user.status === 'logging_out') {
            return <Spinner/>
        }

        return <FormGenerator {...{
            formName: 'login-form',
            button: this.state.button,
            elements: [
                {type: 'text', placeholder: 'Email', onChange: this.validateFields, name: 'email', defaultValue: email},
                {type: 'password', placeholder: 'Contraseña', onChange: this.validateFields, name: 'password', defaultValue: password}
            ],
            callback: this.handleSubmit.bind(this),
            object: this,
            initialRefs: this.initialRefs
        }}/>
    }

    validateFields() {
        if (this.refs.email.value !== '' && this.refs.password.value !== '') {
            this.setState({
                button: {value: 'Login'}
            });
        } else if (this.state.button.disabled === undefined) {
            this.setState({
                button: {value: 'Login', disabled: "disabled"}
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
                button: {value: 'Login', disabled: 'disabled'}
            })
        }
    }

}