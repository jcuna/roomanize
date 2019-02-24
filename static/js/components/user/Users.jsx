/**
 * Created by Jon on 1/11/18.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createUser, deleteUser, editUser, fetchUsers } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';
import { hideOverlay, showOverlay } from '../../actions/appActions';
import UserManager from './UserManager';
import { fetchRoles } from '../../actions/roleActions';
import { hasAccess } from '../../utils/config';
import { ACCESS_TYPES, ENDPOINTS, STATUS } from '../../constants';
import { searchArray } from '../../utils/helpder';

export default class Users extends React.Component {
    constructor(props) {
        super(props);

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
            searching: false,
            found: []
        };
        if (props.roles.assigned.length === 0) {
            props.dispatch(fetchRoles());
        }
        if (props.user.list.status !== STATUS.TRANSMITTING && props.user.list.users.length === 0) {
            props.dispatch(fetchUsers());
        }

        this.search = this.search.bind(this);
    }

    search({ target }) {
        if (target.value !== '') {
            const found = searchArray(this.props.user.list.users, target.value, 'name', 'email');

            this.setState({
                found,
                searching: true
            });
        } else {
            this.setState({
                found: [],
                searching: false
            });
        }
    }

    render() {
        const dir = this.state.orderDir === 'asc' ? 'down' : 'up';
        const { user } = this.props;

        const displayData = this.state.searching ? this.state.found : user.list.users;

        return <div>
            <h2>Usuarios</h2>
            <div className='table-actions'>
                <input
                    placeholder='Buscar'
                    onChange={ this.search }
                    className='form-control'
                />
                <button
                    disabled={ this.props.roles.assigned.length === 0 }
                    onClick={ () => this.openUserManager() }
                    className='btn btn-success'>
                    Nuevo Usuario
                </button>
            </div>
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>
                            id <i className={ `text-info fas fa-sort-numeric-${dir}` }
                                onClick={ () => this.orderBy('id') }/>
                        </th>
                        <th>
                            Nombre <i className={ `text-info fas fa-sort-alpha-${dir }` }
                                onClick={ () => this.orderBy('last_name') }/></th>
                        <th>
                            Email <i className={ `text-info fas fa-sort-alpha-${dir}` }
                                onClick={ () => this.orderBy('email') }/></th>
                        <th>
                            Roles
                        </th>
                        <th>
                            Editar
                        </th>
                        <th>
                            Borrar
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((userFromList, i) => {
                        i++;
                        const rolesCount = userFromList.roles.length;
                        const canEdit = hasAccess(ENDPOINTS.USERS_MANAGER_URL, ACCESS_TYPES.WRITE) &&
                            userFromList.email !== user.email;
                        const canDelete = hasAccess(ENDPOINTS.USERS_MANAGER_URL, ACCESS_TYPES.DELETE) &&
                            userFromList.email !== user.email;

                        return <tr key={ i }>
                            <th scope='row'>{ i }</th>
                            <td>{userFromList.id}</td>
                            <td>{userFromList.name}</td>
                            <td>{userFromList.email}</td>
                            <td>
                                {userFromList.roles.map((obj, r) => r < rolesCount - 1 ? `${obj.name}, ` : obj.name)}
                            </td>
                            <td>
                                <i className={ canEdit ? 'text-info fas fa-user-edit' : 'fas fa-ban' }
                                    aria-hidden='true'
                                    onClick={ canEdit ? () => {
                                        this.openUserManager({
                                            ...userFromList,
                                            roles: userFromList.roles.slice()
                                        });
                                    } : null }/>
                            </td>
                            <td>
                                <i className={ canDelete ? 'text-danger fas fa-trash' : 'fas fa-ban' }
                                    aria-hidden='true'
                                    onClick={ canDelete ? () => this.deleteUser(userFromList.id) : null }/>
                            </td>
                        </tr>;
                    })}
                </tbody>
            </table>
            { user.list.users.length === 0 &&
            <div style={ { position: 'absolute', left: '50%' } }><Spinner/></div> }
        </div>;
    }

    openUserManager(user) {
        const onSubmit = typeof user === 'undefined' ? this.createUser : this.editUser;

        this.props.dispatch(
            showOverlay(
                <UserManager { ...this.props } onDataChanged={ this.updateNewUserData } editingUser={ user }
                    onSubmit={ onSubmit }/>,
                'Administracion de Usuarios'
            )
        );
    }

    editUser(e) {
        e.preventDefault();
        e.target.className += ' loading-button';
        this.props.dispatch(editUser(this.state.newUser, () => {
            // show notification
            this.props.dispatch(hideOverlay());
        }, () => {
            // show notification
            this.props.dispatch(hideOverlay());
        }));
    }

    createUser(e) {
        e.preventDefault();
        e.target.disabled = true;
        e.target.className += ' loading-button';
        this.props.dispatch(createUser(this.state.newUser));
    }

    deleteUser(id) {
        const button = <button
            type='button' onClick={ ({ target }) => {
                target.className += ' loading-button';
                this.props.dispatch(deleteUser(id, () => this.props.dispatch(hideOverlay())));
            } } className='btn btn-danger'>Confirmar</button>;

        this.props.dispatch(showOverlay(
            <div className='panel'>Estas seguro que quieres elimiar el usuario seleccionado?</div>,
            <div className='warning-prompt'><i className='fas fa-exclamation-triangle'/>Advertencia...</div>,
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
            orderDir = orderDir === 'asc' ? 'desc' : 'asc';
        }
        this.setState({ orderBy: column, orderDir });
        this.props.dispatch(fetchUsers(column, orderDir));
    }

    componentDidUpdate() {
        if (this.props.user.list.status !== STATUS.TRANSMITTING && this.props.user.list.users.length === 0) {
            this.props.dispatch(fetchUsers());
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        roles: PropTypes.object,
        user: PropTypes.object,
    }
}
