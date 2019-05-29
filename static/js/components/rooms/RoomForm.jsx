/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';
import PropTypes from 'prop-types';
import { createRoom, editRoom, fetchRooms, selectRoom } from '../../actions/roomActions';
import { notifications } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { Redirect } from 'react-router-dom';

export default class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: this.props.rooms.selectedRoom.id ? 'Editar' : 'Agregar', disabled: true },
            name: this.props.rooms.selectedRoom.name || '',
            description: this.props.rooms.selectedRoom.description || '',
            id: this.props.rooms.selectedRoom.id || 0,
            project_id: this.props.rooms.selectedRoom.project_id || 0,
            picture: this.props.rooms.selectedRoom.picture || '',
            errors: true,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    render() {
        if (typeof this.props.match.params.room_id !== 'undefined' && this.state.id === 0) {
            return <Redirect to={ ENDPOINTS.ROOMS_URL }/>;
        }

        const creating = typeof this.props.rooms.selectedRoom.id === 'undefined';

        return <div>
            <Breadcrumbs { ...this.props } title={ creating ? 'Nuevo' : 'Editar' }/>
            <section className='widget'>
                <FormGenerator { ...{
                    className: 'form-group row',
                    formName: 'new-room',
                    button: this.state.button,
                    elements: [
                        {
                            className: 'col-6',
                            type: 'text',
                            placeholder: 'Numero/Nombre de Habitación',
                            onChange: this.onInputChange,
                            name: 'room-name',
                            defaultValue: this.state.name,
                            validate: 'required',
                        },
                        {
                            className: 'col-6',
                            type: 'text',
                            placeholder: 'Notas',
                            onChange: this.onInputChange,
                            name: 'notes',
                            defaultValue: this.state.description,
                        },
                    ],
                    onSubmit: this.handleSubmit,
                } }/>
            </section>
        </div>;
    }

    handleSubmit(event, validation) {
        const room = {
            project_id: this.props.user.attributes.preferences.default_project,
            name: validation['room-name'].value,
            description: validation.notes.value,
            picture: '',
        };

        let action = createRoom;

        let msg = 'agregada';

        if (this.state.id !== 0) {
            msg = 'actualizada';
            room.id = this.state.id;
            action = editRoom;
        }

        this.props.dispatch(action(
            room,
            (resp) => {
                this.props.dispatch(notifications({
                    type: ALERTS.SUCCESS,
                    message: 'Habitacion ' + msg + ' correctamente.',
                }));
                room.id = resp.id || room.id;
                this.props.dispatch(selectRoom(room));
                this.setState(room);
                this.props.dispatch(fetchRooms(this.props.rooms.data.page));
            }, (error) => {
                this.props.dispatch(notifications({
                    type: ALERTS.DANGER,
                    message: error.status === 400 ? error.resp.error : GENERIC_ERROR,
                }));
            }),
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.pathname === `${ENDPOINTS.ROOMS_URL}/nuevo` &&
            prevState.id !== this.state.id) {
            this.props.history.push(`${ENDPOINTS.ROOMS_URL}/editar/${this.props.rooms.selectedRoom.id}`);
        }
    }

    onInputChange(e, validation) {
        if (validation['room-name'].isValid) {
            this.formIsValid(true);
        } else {
            this.formIsValid(false);
        }
    }

    formIsValid(isIt) {
        this.setState({
            errors: isIt,
            button: { value: this.props.rooms.selectedRoom.id ? 'Editar' : 'Agregar', disabled: !isIt },
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        user: PropTypes.object,
        history: PropTypes.object,
        match: PropTypes.object,
        location: PropTypes.object,
        rooms: PropTypes.object,
    };
}
