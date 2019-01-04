/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar', disabled: true },
            rent: '',
            roomName: '',
            errors: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
    }

    render() {
        return <FormGenerator { ...{
            formName: 'new-room',
            button: this.state.button,
            elements: [
                { type: 'text', placeholder: 'Numero/Nombre de Habitación', onChange: this.validateFields, name: 'room-number', defaultValue: this.state.rent },
                { type: 'text', placeholder: 'Precio al mes', onChange: this.validateFields, name: 'rent', defaultValue: this.state.rent }
            ],
            callback: this.handleSubmit,
            object: this
            // initialRefs: this.initialRefs
        } }/>;
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
}
