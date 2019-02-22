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

export default class Room extends Component {
    constructor(props) {
        super(props);

        if (this.props.rooms.status === STATUS.PENDING) {
            this.props.dispatch(fetchRooms(1, () => {
                this.props.dispatch(notifications({
                    type: ALERTS.DANGER, message: 'No se pudo obtener lista de habitaciones.'
                }));
            }));
        }

        this.props.dispatch(selectRoom({}));

        this.selectRoom = this.selectRoom.bind(this);
    }

    render() {
        return (
            <section>
                { hasAccess(this.props.history.location.pathname, ACCESS_TYPES.WRITE) &&
                <button
                    onClick={ () => this.props.history.push(`${ENDPOINTS.ROOMS_URL}/nuevo`) }
                    className='btn btn-success'>
                    Nueva Habitación
                </button>
                }
                { this.getList() }
            </section>
        );
    }

    getList() {
        if (this.props.rooms.status === STATUS.PENDING) {
            return <Spinner/>;
        }
        const canEdit = hasAccess(ENDPOINTS.ROOMS_URL, ACCESS_TYPES.WRITE);

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
                { this.props.rooms.data.list.map((item, i) => {
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
