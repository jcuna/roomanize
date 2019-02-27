/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fetchRooms, ROOMS_SEARCHING, searchRooms, selectRoom } from '../../actions/roomActions';
import { notifications } from '../../actions/appActions';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, STATUS } from '../../constants';
import { hasAccess } from '../../utils/config';
import Spinner from '../../utils/Spinner';
import Link from 'react-router-dom/es/Link';
import { afterPause, searchArray } from '../../utils/helpers';
import Paginate from '../../utils/Paginate';

export default class Room extends Component {
    constructor(props) {
        super(props);

        this.state = {
            found: [],
            searching: false,
            page: props.match.params.page || 1,
        };

        if (props.rooms.status === STATUS.PENDING) {
            this.paginateRooms();
        } else {
            this.state.page = props.rooms.data.page;
            this.props.history.push(`${ENDPOINTS.ROOMS_URL}/${this.state.page}`);
        }

        props.dispatch(selectRoom({}));
        this.selectRoom = this.selectRoom.bind(this);
        this.search = this.search.bind(this);
        this.switchPage = this.switchPage.bind(this);
    }

    paginateRooms() {
        this.props.dispatch(fetchRooms(this.state.page, () => {
            this.props.dispatch(notifications({
                type: ALERTS.DANGER, message: 'No se pudo obtener lista de habitaciones.'
            }));
        }));
    }

    render() {
        const { history, rooms } = this.props;

        return (
            <section>
                { hasAccess(history.location.pathname, ACCESS_TYPES.WRITE) &&
                <div className='table-actions'>
                    <input
                        placeholder='Buscar'
                        onChange={ this.search }
                        className='form-control'
                    />
                    <button
                        onClick={ () => history.push(`${ENDPOINTS.ROOMS_URL}/nuevo`) }
                        className='btn btn-success'>
                        Nueva Habitación
                    </button>
                </div>
                }
                { this.getList() }
                { rooms.data.total_pages > 1 && !this.state.searching &&
                <Paginate
                    total_pages={ rooms.data.total_pages }
                    onPageChange={ this.switchPage }
                    initialPage={ this.state.page }
                />
                }
            </section>
        );
    }

    switchPage(number) {
        this.props.history.push(`${ENDPOINTS.ROOMS_URL}/${number}`);
        this.setState({
            page: number
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.page !== this.state.page) {
            this.paginateRooms();
        }
    }

    search({ target }) {
        if (target.value !== '') {
            const found = searchArray(this.props.rooms.data.list, target.value, 'name');

            if (found.length === 0) {
                this.props.dispatch({ type: ROOMS_SEARCHING });
                afterPause(() => {
                    this.props.dispatch(searchRooms(target.value,
                        (data) => {
                            this.setState({
                                found: data.list,
                                searching: true
                            });
                        },
                        (err) => {
                            //TODO: handle err
                            console.warn(err);
                        })
                    );
                });
            }

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
        if (this.props.rooms.status === STATUS.PENDING || this.props.rooms.searchingBackEnd) {
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
                            <Link to={ `${ENDPOINTS.ROOMS_URL}/editar/${item.id}` } onClick={ this.selectRoom }>
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
        match: PropTypes.object,
    };
}
