/**
 * Created by Jon on 12/23/17.
 */
import FormGenerator from "../../utils/FromGenerator";
import {commitPermissions, createRole, fetchRoles} from "../../actions/roleActions";
import Spinner from "../Spinner";
import {hideOverlay, notifications, showOverlay} from "../../actions/appActions";
import '../../../css/roles.scss';
import Permissions from "../Permissions";

export default class Roles extends React.Component {

    constructor() {
        super();
        this.state = {
            button: {value: 'Agregar role', disabled: "disabled"}
        };

        this.modifyPermissions = this.modifyPermissions.bind(this);
        this.confirmChanges = this.confirmChanges.bind(this);
        this.updateObject = this.updateObject.bind(this);
    }

    componentWillMount() {
        if (this.props.roles.status === 'pending') {
            this.props.dispatch(fetchRoles());
        }
    }

    render () {
        return (
            <div className="roles-layout">
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
        this.props.roles.assigned.forEach((item) => {
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
            {this.props.roles.assigned.map((item, i) => {
                i++;
                return <tr key={i}>
                    <th scope="row">{i}</th>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                        <i className="fa fa-pencil-square-o" data-id={item.id} aria-hidden="true" onClick={this.modifyPermissions}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
    }

    modifyPermissions(e) {
        const button = <button
            type="button" onClick={this.confirmChanges} className="btn btn-primary">OK
        </button>;
        this.props.dispatch(showOverlay(
            <Permissions {...this.props} id={Number(e.target.getAttribute('data-id'))} onUpdate={this.updateObject}/>,
            'Editar Permisos',
            true,
            button)
        );
    }

    confirmChanges() {
        if (this.updatedPermissions !== undefined) {
            this.props.dispatch(commitPermissions(this.updatedPermissions))
        }
        this.props.dispatch(hideOverlay());
    }

    updateObject(updatedPermissions) {
        this.updatedPermissions = updatedPermissions;
    }

}