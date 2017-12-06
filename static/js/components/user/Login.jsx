/**
 * Created by Jon on 12/3/17.
 */
import FormGenerator from "../../utils/FromGenerator";

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.validateUsername = this.validateUsername.bind();
        this.validatePassword = this.validatePassword.bind();
    }

    render() {
        return <FormGenerator {...{
            formName: 'login-form',
            buttonValue: 'Login',
            elements: [
                {type: 'text', placeholder: 'Usuario', onChange: this.validateUsername},
                {type: 'password', placeholder: 'Contraseña', onChange: this.validatePassword}
            ],
            callback: this.handleSubmit.bind(this),
            object: this
        }}/>
    }

    validateUsername(e) {

    }

    validatePassword(e) {
        console.log(e.target.value)
    }

    handleSubmit(e) {
        e.preventDefault();
    }

}