/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';
import { fetchTimeIntervals } from '../../actions/projectActions';
import PropTypes from 'prop-types';

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar', disabled: true },
            rent: '',
            roomName: '',
            notes: '',
            errors: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
        if (props.projects.timeIntervals.length === 0) {
            props.dispatch(fetchTimeIntervals());
        }
    }

    render() {
        return <FormGenerator { ...{
            className: 'form-group row',
            formName: 'new-room',
            button: this.state.button,
            elements: [
                {
                    className: 'col-6',
                    type: 'text',
                    placeholder: 'Numero/Nombre de Habitación',
                    onChange: this.validateFields,
                    name: 'room-number',
                    defaultValue: this.state.roomName
                },
                {
                    className: 'col-6',
                    type: 'text',
                    placeholder: 'Precio al mes',
                    onChange: this.validateFields,
                    name: 'rent',
                    defaultValue: this.state.rent
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    onChange: this.validateFields,
                    name: 'interval',
                    options: this.getTimeIntervalOptions()
                },
                {
                    className: 'col-6',
                    type: 'text',
                    placeholder: 'Notas',
                    onChange: this.validateFields,
                    name: 'notes',
                    defaultValue: this.state.notes
                },
            ],
            callback: this.handleSubmit,
            object: this
            // initialRefs: this.initialRefs
        } }/>;
    }

    getTimeIntervalOptions() {
        const options = [];

        options[0] = 'Intervalo de Pago';

        this.props.projects.timeIntervals.forEach(item => options[item.id] = item.interval);
        return options;
    }

    handleSubmit() {

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
            button: { value: 'Agregar', disabled: !isIt }
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object
    }
}
