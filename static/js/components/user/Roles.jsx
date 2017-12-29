/**
 * Created by Jon on 12/23/17.
 */
import FormGenerator from "../../utils/FromGenerator";
import {createRole, fetchRoles} from "../../actions/roleActions";
import Spinner from "../Spinner";
import {notifications} from "../../actions/appActions";

export default class Roles extends React.Component {

    constructor() {
        super();
        this.state = {
            button: {value: 'Agregar role', disabled: "disabled"}
        }
    }

    componentWillMount() {
        if (this.props.roles.status === 'pending') {
            this.props.dispatch(fetchRoles());
        }
    }

    render () {
        return (
            <div>
                {this.rolesTable}
                <FormGenerator {...{
                    formName: 'roles-form',
                    button: this.state.button,
                    callback: this.submit.bind(this),
                    object: this,
                    elements: [
                        {type: 'input', placeholder: 'Role', onChange: this.toggleButtonDisabled.bind(this), name: 'role'}
                    ]
                }}/>
            </div>
        )
    }

    toggleButtonDisabled() {
        if (this.refs.role.value !== '' && this.state.button.disabled !== undefined) {
            this.setState({
                button: {value: 'Agregar role'}
            });
        } else if (this.refs.role.value === '' && this.state.button.disabled === undefined) {
            this.setState({
                button: {value: 'Agregar role', disabled: "disabled"}
            });
        }
    }

    submit(e) {
        e.preventDefault();
        let exists = false;
        this.props.roles.data.forEach((item) => {
            if (item.name.toLowerCase() === this.refs.role.value.toLowerCase()) {
                exists = true;
            }
        });

        if (exists) {
            this.props.dispatch(notifications([
                {type: 'danger', message: "Role con mismo nombre ya existe"}
            ]));
            this.refs.role.value = ''
        } else {
            this.props.dispatch(createRole(this.refs.role.value));
            this.refs.role.value = '';
        }
    }

    get rolesTable() {
        if (this.props.roles.status === 'fetching') {
            return <Spinner/>;
        }
        return <table className="table table-striped">
            <thead>
            <tr>
                <th>#</th>
                <th>id</th>
                <th>Nombre</th>
                <th>Permisos</th>
            </tr>
            </thead>
            <tbody>
            {this.props.roles.data.map((item, i) => {
                i++;
                return <tr key={i}>
                    <th scope="row">{i}</th>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.permissions}</td>
                </tr>
            })}
            </tbody>
        </table>
    }
}