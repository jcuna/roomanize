/**
 * Created by Jon on 1/11/18.
 */
import {getUsers} from "../../actions/userActions";
import Spinner from "../Spinner";
import {hideOverlay, showOverlay} from "../../actions/appActions";
import UserManager from "./UserManager";
import {fetchRoles} from "../../actions/roleActions";

export default class Users extends React.Component {
    constructor() {
        super();
        this.openUserManager = this.openUserManager.bind(this);
        this.editUser = this.editUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateNewUserData = this.updateNewUserData.bind(this);

        this.state = {
            newUser: {}
        }
    }

    componentWillMount() {
        this.props.dispatch(getUsers());
        if (this.props.roles.assigned.length === 0) {
            this.props.dispatch(fetchRoles());
        }
    }

    render() {
        return <div>
            <h2>Usuarios</h2>
            <div style={{textAlign: 'right', width: '100%'}}>
                <button
                    disabled={this.props.roles.assigned.length === 0}
                    onClick={() => this.openUserManager()}
                    style={{marginBottom: '10px'}}
                    className='btn btn-success'>
                    Nuevo Usuario
                </button>
            </div>
            {this.props.user.list.length === 0 && <Spinner/>}
            <table className="table table-striped">
            <thead>
            <tr>
                <th>#</th>
                <th>id</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Editar</th>
                <th>Borrar</th>
            </tr>
            </thead>
            <tbody>
            {this.props.user.list.map((user, i) => {
                i++;
                const rolesCount = user.roles.length;
                const canEdit = user.email !== this.props.user.email;
                return <tr key={i}>
                    <th scope="row">{i}</th>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.roles.map((obj, r) => r < rolesCount - 1 ? `${obj.name}, ` : obj.name)}</td>
                    <td>
                        <i className={canEdit ? 'fas fa-user-edit' : 'fas fa-ban'}
                           aria-hidden="true"
                           onClick={canEdit? () => this.openUserManager({...user, roles: user.roles.slice()}) : undefined}/>
                    </td>
                    <td>
                        <i className={canEdit ? 'text-danger fas fa-trash' : 'fas fa-ban'}
                           aria-hidden="true"
                           onClick={canEdit? () => this.deleteUser(user.id) : undefined}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        </div>
    }

    openUserManager(user) {
        let onSubmit = user === undefined ? this.createUser : this.editUser;
        this.props.dispatch(
        showOverlay(
            <UserManager {...this.props} onDataChanged={this.updateNewUserData} editingUser={user} onSubmit={onSubmit}/>,
            'Administracion de Usuarios'
        ));
    }

    editUser(e) {
        e.preventDefault();
        console.log(this.state.newUser);
    }

    createUser(e) {
        e.preventDefault();
        console.log(this.state.newUser);
    }

    deleteUser(id) {
        const button = <button
            type="button" onClick={() => {
                this.props.dispatch(hideOverlay());
                console.log('deleting user')
                // this.props.dispatch(deleteUser(id));
            }} className='btn btn-danger'>Confirmar</button>;

        this.props.dispatch(showOverlay(
            <div className="panel">Estas seguro que quieres elimiar el usuario seleccionado?</div>,
            <div className="warning-prompt"><i className="fa fa-exclamation-triangle"/>Cuidado...</div>,
            true,
            button)
        );
    }

    updateNewUserData(user) {
        if (user.first_name !== '' && user.last_name !== '' && user.email !== '') {
            this.setState({
                newUser: user
            });
        }
    }
}