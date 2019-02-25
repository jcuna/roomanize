/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';
import { fetchTimeIntervals } from '../../actions/projectActions';
import PropTypes from 'prop-types';
import { createRoom } from '../../actions/roomActions';
import { notifications } from '../../actions/appActions';
import { ALERTS, ENDPOINTS } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { Redirect } from 'react-router-dom';

export default class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar', disabled: true },
            rent: this.props.rooms.selectedRoom.rent || '',
            name: this.props.rooms.selectedRoom.name || '',
            description: this.props.rooms.selectedRoom.description || '',
            time_interval_id: this.props.rooms.selectedRoom.time_interval_id || 0,
            id: this.props.rooms.selectedRoom.id || 0,
            project_id: this.props.rooms.selectedRoom.project_id || 0,
            picture: this.props.rooms.selectedRoom.picture || '',
            errors: true,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
        if (props.projects.timeIntervals.length === 0) {
            props.dispatch(fetchTimeIntervals());
        }
    }

    render() {
        if (typeof this.props.match.params.room_id !== 'undefined' && this.state.id === 0) {
            return <Redirect to={ ENDPOINTS.ROOMS_URL }/>;
        }

        const creating = typeof this.props.rooms.selectedRoom.id === 'undefined';

        return <section>
            <Breadcrumbs { ...this.props } title={ creating ? 'Nuevo' : 'Editar' }/>
            <FormGenerator { ...{
                className: 'form-group row',
                formName: 'new-room',
                button: this.state.button,
                elements: [
                    {
                        className: 'col-6',
                        type: 'text',
                        placeholder: 'Numero/Nombre de Habitación',
                        onChange: this.validateFields,
                        name: 'room-name',
                        defaultValue: this.state.name,
                    },
                    {
                        className: 'col-6',
                        type: 'text',
                        placeholder: 'Precio al mes',
                        onChange: this.validateFields,
                        name: 'rent',
                        defaultValue: this.state.rent,
                    },
                    {
                        formElement: 'select',
                        className: 'col-6',
                        onChange: this.validateFields,
                        name: 'interval',
                        options: this.getTimeIntervalOptions(),
                        defaultValue: this.state.time_interval_id,
                    },
                    {
                        className: 'col-6',
                        type: 'text',
                        placeholder: 'Notas',
                        onChange: this.validateFields,
                        name: 'notes',
                        defaultValue: this.state.description,
                    },
                ],
                callback: this.handleSubmit,
                object: this,
            } }/>
        </section>;
    }

    getTimeIntervalOptions() {
        const options = [];

        options[0] = 'Intervalo de Pago';

        this.props.projects.timeIntervals.forEach(
            item => options[item.id] = item.interval);
        return options;
    }

    handleSubmit(event) {
        event.preventDefault();

        this.props.dispatch(createRoom(
            {
                project_id: this.props.user.attributes.preferences.default_project,
                name: this.refs.room_name.value,
                rent: this.refs.rent.value,
                time_interval_id: this.refs.interval.value,
                description: this.refs.notes.value,
                picture: '',

            },
            (resp) => {
                this.props.dispatch(notifications({
                    type: ALERTS.SUCCESS,
                    message: 'Habitacion agregada correctamente.',
                }));
                this.props.history.push(`${ENDPOINTS.ROOMS_URL}/${resp.id}`);
            },
            (error) => {
                this.props.dispatch(notifications({
                    type: ALERTS.DANGER,
                    message: error.data.message,
                }));
            }),
        );
    }

    validateFields({ target }) {
        if (target.name === 'rent') {
            if (isNaN(target.value) && target.value !== '') {
                if (!target.classList.contains('is-invalid')) {
                    target.classList.add('is-invalid');
                    this.formIsValid(false);
                }
            } else {
                this.formIsValid(true);
                if (target.classList.contains('is-invalid')) {
                    target.classList.remove('is-invalid');
                }
            }
        }
    }

    formIsValid(isIt) {
        this.setState({
            errors: isIt,
            button: { value: 'Agregar', disabled: !isIt },
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        user: PropTypes.object,
        history: PropTypes.object,
        match: PropTypes.object,
        rooms: PropTypes.object,
    };
}
