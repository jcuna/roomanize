/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';

export default class NewRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar' }
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
    }
    render() {
        return <FormGenerator { ...{
            formName: 'new-room',
            button: this.state.button,
            elements: [
                { type: 'text', placeholder: 'Numero/Nombre de Habitación', onChange: this.validateFields, name: 'room-number' },
                { type: 'text', placeholder: 'Precio al mes', onChange: this.validateFields, name: 'room-number' }
            ],
            callback: this.handleSubmit,
            object: this
            // initialRefs: this.initialRefs
        } }/>;
    }

    handleSubmit() {

    }

    validateFields() {

    }
}
