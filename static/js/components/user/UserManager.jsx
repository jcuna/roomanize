/**
 * Created by Jon on 6/5/18.
 */

import PropTypes from 'prop-types';
import FormGenerator from "../../utils/FromGenerator";
import Checkbox from "../../utils/Checkbox";
import {hideOverlay} from "../../actions/appActions";

export default class UserManager extends React.Component {

    constructor(props) {
        super();

        let checkboxes = {};
        let roles = [];
        if (props.editingUser !== undefined) {
            props.editingUser.roles.forEach(role => {
                checkboxes[role.name] = true;
            });
            roles = props.editingUser.roles
        }

        this.state = {
            deleteButtonClass: 'btn btn-danger',
            actionButtonDisabled: true,
            checkboxes: checkboxes,
            roles: roles
        };

        this.updateUserData = this.updateUserData.bind(this);
        this.updateUserDataRoles = this.updateUserDataRoles.bind(this);
    }

    static propTypes = {
        editingUser: PropTypes.shape({
            id: PropTypes.number.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            roles: PropTypes.array.isRequired
        }),
        roles: PropTypes.object,
        onDataChanged: PropTypes.func,
        onSubmit: PropTypes.func
    };

    render() {
        return <div><FormGenerator {...{
            formName: 'create-user-form',
            object: this,
            elements: this.formElements
        }}/>
            <h5>Aplicar los siguientes roles al usuario</h5>
            <hr/>
            <ul style={{
                listStyle: 'none',
                columnCount: 2,
                columnGap: '20px',
                marginTop: '10px'
            }}>
            {this.props.roles.assigned.map(role => {
                let checked = this.state.checkboxes[role.name] === true;
                return <li key={role.id}><Checkbox
                    checked={checked}
                    onChange={(this.updateUserDataRoles)}
                    name={role.name}
                    value={role.id}
                    label={role.name}/></li>
            })}
            </ul>
            <div style={{textAlign: 'right'}}>
                <hr/>
                <button className='btn btn-secondary'
                        style={{marginRight: '10px'}}
                        onClick={() => this.props.dispatch(hideOverlay())}>Cerrar
                </button>
                <button className='btn btn-success'
                        disabled={this.state.actionButtonDisabled}
                        onClick={this.props.onSubmit}>
                    {this.props.editingUser === undefined ? 'Crear Usuario' : 'Guardar'}
                </button>
            </div>
        </div>
    }

    recordCheckboxValues(checkbox) {
        let checkboxState = this.state.checkboxes;
        checkboxState[checkbox.name] = checkbox.checked;
        this.setState({
            checkboxes: checkboxState
        });
    }

    updateUserData() {
        let user = {
            first_name: this.refs.first_name.value,
            last_name: this.refs.last_name.value,
            email: this.refs.email.value,
            roles: this.state.roles
        };
        if (this.props.editingUser !== undefined) {
            user.id = this.props.editingUser.id;
        }
        this.props.onDataChanged(user);
        this.userIsValid(user);
    }

    updateUserDataRoles(checkbox) {
        this.recordCheckboxValues(checkbox);
        let roles = this.state.roles;
        let roleInserted = false;
        roles.forEach((role, i) => {
            if (role.name === checkbox.name) {
                roleInserted = true;
                roles.splice(i, 1, checkbox);
            }
        });

        if (!roleInserted) {
            roles.push(checkbox);
        }

        let user = {
            first_name: this.refs.first_name.value,
            last_name: this.refs.last_name.value,
            email: this.refs.email.value,
            roles: roles
        };

        if (this.props.editingUser !== undefined) {
            user.id = this.props.editingUser.id;
        }
        this.setState({
           roles: roles
        });

        this.props.onDataChanged(user);
        this.userIsValid(user);
    }

    userIsValid(user) {
        if (user.first_name !== '' && user.last_name !== '' && user.email !== '') {
            this.setState({actionButtonDisabled: false})
        } else {
            this.setState({actionButtonDisabled: true})
        }
    }

    get formElements() {
        let elements = [
            {type: 'input', placeholder: 'Nombre', onChange: this.updateUserData, name: 'first-name'},
            {type: 'input', placeholder: 'Apellidos', onChange: this.updateUserData, name: 'last-name'},
            {type: 'input', placeholder: 'Email', onChange: this.updateUserData, name: 'email'}
        ];
        if (this.props.editingUser !== undefined) {
            elements.forEach(item => {
                item.defaultValue = this.props.editingUser[item.name.replace('-', '_')];
                if (item.name === 'email') {
                    item.readOnly = true;
                }
            })
        }
        return elements
    }
}