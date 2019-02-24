/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchRooms, selectRoom } from '../../actions/roomActions';
import { notifications } from '../../actions/appActions';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, STATUS } from '../../constants';
import { hasAccess } from '../../utils/config';
import Spinner from '../../utils/Spinner';
import Link from 'react-router-dom/es/Link';
import { searchArray } from '../../utils/helpder';

export default class Room extends Component {
    constructor(props) {
        super(props);

        this.state = {
            found: [],
            searching: false,
            page: 1
        };

        if (this.props.rooms.status === STATUS.PENDING) {
            this.props.dispatch(fetchRooms(this.state.page, () => {
                this.props.dispatch(notifications({
                    type: ALERTS.DANGER, message: 'No se pudo obtener lista de habitaciones.'
                }));
            }));
        }

        this.props.dispatch(selectRoom({}));
        this.selectRoom = this.selectRoom.bind(this);
        this.search = this.search.bind(this);
    }

    render() {
        return (
            <section>
                { hasAccess(this.props.history.location.pathname, ACCESS_TYPES.WRITE) &&
                <div className='table-actions'>
                    <input
                        placeholder='Buscar'
                        onChange={ this.search }
                        className='form-control'
                    />
                    <button
                        onClick={ () => this.props.history.push(`${ENDPOINTS.ROOMS_URL}/nuevo`) }
                        className='btn btn-success'>
                        Nueva Habitación
                    </button>
                </div>
                }
                { this.getList() }
            </section>
        );
    }

    search({ target }) {
        if (target.value !== '') {
            const found = searchArray(this.props.rooms.data.list, target.value, 'name');

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

    getList() {
        if (this.props.rooms.status === STATUS.PENDING) {
            return <Spinner/>;
        }
        const canEdit = hasAccess(ENDPOINTS.ROOMS_URL, ACCESS_TYPES.WRITE);
        const displayData = this.state.searching ? this.state.found : this.props.rooms.data.list;

        return <table className='table table-striped'>
            <thead>
                <tr>
                    <th>#</th>
                    <th>id</th>
                    <th>Nombre</th>
                    <th>Notas</th>
                    <th>Editar</th>
                </tr>
            </thead>
            <tbody>
                { displayData.map((item, i) => {
                    i++;
                    return <tr key={ i }>
                        <th scope='row'>{ i }</th>
                        <td>{ item.id }</td>
                        <td>{ item.name }</td>
                        <td>{ item.description }</td>
                        <td>
                            { canEdit &&
                            <Link to={ `${ENDPOINTS.ROOMS_URL}/${item.id}` } onClick={ this.selectRoom }>
                                <i className='fa fa-edit' data-id={ item.id }/>
                            </Link> ||
                            <i className='fas fa-ban'/> }
                        </td>
                    </tr>;
                }) }
            </tbody>
        </table>;
    }

    selectRoom({ target }) {
        this.props.rooms.data.list.forEach(room => {
            if (room.id === Number(target.getAttribute('data-id'))) {
                this.props.dispatch(selectRoom(room));
                return;
            }
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        user: PropTypes.object,
        history: PropTypes.object,
        rooms: PropTypes.object,
    };
}
