/**
 * Created by Jon on 1/11/18.
 */
import {getUsers} from "../../actions/userActions";
import Spinner from "../Spinner";

export default class Users extends React.Component {

    componentWillMount() {
        this.props.dispatch(getUsers());
    }

    render() {
        return <div>
            <h2>Usuarios</h2>
            {this.props.user.list.length === 0 &&
            <Spinner/>}
            <table className="table table-striped">
            <thead>
            <tr>
                <th>#</th>
                <th>id</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Borrar</th>
            </tr>
            </thead>
            <tbody>
            {this.props.user.list.map((user, i) => {
                i++;
                const rolesCount = user.roles.length;
                return <tr key={i}>
                    <th scope="row">{i}</th>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                        {user.roles.map((obj, r) => r < rolesCount - 1 ? `${obj.name}, ` : obj.name)}
                        <i style={{marginLeft: 10}} className="fa fa-pencil-square-o" aria-hidden="true" onClick={this.editUserROles}/>
                    </td>
                    <td>
                        <i className="danger fa fa-trash-o" aria-hidden="true" onClick={this.deleteUser}/>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        </div>
    }
}