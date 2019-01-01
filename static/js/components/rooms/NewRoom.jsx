/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';

export default class NewRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar' },
            rent: ''
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
                { type: 'text', placeholder: 'Precio al mes', onChange: this.validateFields, name: 'rent' }
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
            if (isNaN(target.value)) {
                target.value = this.state.rent;
            }
            // else {
            //     this.setState({
            //         rent: `${this.state.rent}${target.value}`
            //     });
            //     target.value = this.state.rent
            // }
        }
    }
}
