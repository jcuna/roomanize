/**
 * Created by Jon on 1/11/18.
 */
import {createUser, fetchUsers} from "../../actions/userActions";
import Spinner from "../Spinner";
import {hideOverlay, showOverlay} from "../../actions/appActions";
import UserManager from "./UserManager";
import {fetchRoles} from "../../actions/roleActions";
import {hasAccess} from "../../utils/config";

export default class Users extends React.Component {
    constructor(props) {
        super();
        this.openUserManager = this.openUserManager.bind(this);
        this.editUser = this.editUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateNewUserData = this.updateNewUserData.bind(this);
        this.orderBy = this.orderBy.bind(this);

        this.state = {
            newUser: {},
            orderDir: 'asc',
            orderBy: 'id',
            page: 1,
        };
        if (props.roles.assigned.length === 0) {
            props.dispatch(fetchRoles());
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.user.list.status !== 'fetching' && props.user.list.users.length === 0) {
            props.dispatch(fetchUsers());
        }
        return state;
    }

    render() {
        let dir = this.state.orderDir === 'asc' ? 'down' : 'up';
        return <div>
            <h2>Usuarios</h2>
            <div style={{textAlign: 'right', width: '100%', padding: '10px'}}>
                <input placeholder='Buscar'
                       onChange={() => {}}
                       className='form-control'
                       style={{width: '160px', marginRight: '10px', display: 'inline', top: '2px', position: 'relative'}}
                />
                <button
                    disabled={this.props.roles.assigned.length === 0}
                    onClick={() => this.openUserManager()}
                    className='btn btn-success'>
                    Nuevo Usuario
                </button>
            </div>
            <table className="table table-striped">
            <thead>
            <tr>
                <th>#</th>
                <th>id <i className={`text-info fas fa-sort-numeric-${dir}`} onClick={() => this.orderBy('id')}/></th>
                <th>Nombre <i className={`text-info fas fa-sort-alpha-${dir}`} onClick={() => this.orderBy('last_name')}/></th>
                <th>Email <i className={`text-info fas fa-sort-alpha-${dir}`} onClick={() => this.orderBy('email')}/></th>
                <th>Roles</th>
                <th>Editar</th>
                <th>Borrar</th>
            </tr>
            </thead>
            <tbody>
            {this.props.user.list.users.map((user, i) => {
                i++;
                const rolesCount = user.roles.length;
                const canEdit = hasAccess('/users', 'write') && user.email !== this.props.user.email;
                const canDelete = hasAccess('/users', 'delete') && user.email !== this.props.user.email;
                return <tr key={i}>
                    <th scope="row">{i}</th>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.roles.map((obj, r) => r < rolesCount - 1 ? `${obj.name}, ` : obj.name)}</td>
                    <td>
                        <i className={canEdit ? 'text-info fas fa-user-edit' : 'fas fa-ban'}
                           aria-hidden="true"
                           onClick={canEdit? () => this.openUserManager({...user, roles: user.roles.slice()}) : undefined}/>
                    </td>
                    <td>
                        <i className={canDelete ? 'text-danger fas fa-trash' : 'fas fa-ban'}
                           aria-hidden="true"
                           onClick={canDelete? () => this.deleteUser(user.id) : undefined}/>
                    </td>
                </tr>})}
            </tbody>
            </table>
            {this.props.user.list.users.length === 0 && <div style={{position: 'absolute', left: '50%'}}><Spinner/></div>}
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
        e.target.disabled = true;
        e.target.className += ' loading-button';
        this.props.dispatch(createUser(this.state.newUser))
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
            <div className="warning-prompt"><i className="fas fa-exclamation-triangle"/>Cuidado...</div>,
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

    orderBy(column) {
        let orderDir = this.state.orderDir;
        if (this.state.orderBy === column) {
            orderDir = orderDir === 'asc' ? 'desc' : 'asc'
        }
        this.setState({orderBy: column, orderDir: orderDir});
        this.props.dispatch(fetchUsers(column, orderDir));
    }
}