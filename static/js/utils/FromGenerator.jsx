/**
 * Created by Jon on 9/21/16.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FORM_VALIDATION } from '../constants';

class FormGenerator extends React.Component {
    constructor(props) {
        super(props);

        const references = {};

        props.elements.forEach(element => {
            references[element.name] = {
                isValid: true,
                value: ''
            };
        });
        this.state = references;
    }

    /**
     *
     * @returns {*}
     */
    render() {
        const form = this.generateForm(
            this.props.elements,
            this.props.formName,
            this.props.button,
            this.props.className || 'form-section'
        );

        return (<div>{form}</div>);
    }

    /**
     * pass refs down to callee
     */
    componentDidMount() {
        if (typeof this.props.object !== 'undefined') {
            this.props.object.refs = { ...this.refs };
        }
        if (typeof this.props.initialRefs !== 'undefined') {
            this.props.initialRefs(this.refs);
        }
    }

    /**
     * @private
     *
     * @param {array} elements
     * @param {string} formName
     * @param {object} button
     * @param {string} sectionClass
     * @returns {*}
     */
    generateForm(elements, formName, button, sectionClass) {
        return React.createElement(
            'form',
            { className: formName, onSubmit: this.props.callback },

            React.createElement('section', { className: sectionClass },
                elements.map((b, k) => {
                    if (React.isValidElement(b)) {
                        return b;
                    }
                    return this.createInputElement(b, k);
                }),
            ),
            typeof button !== 'undefined' && React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement(
                    'button', { ...button, className: `btn btn-${button.type || 'primary'}` },
                    button.value || 'Submit'
                )
            )
        );
    }

    createInputElement(element, key) {
        const isMultiCol = FormGenerator.colForm(element);
        const formElement = typeof element.formElement === 'undefined' ? 'input' : element.formElement;
        const reference = FormGenerator.getReference(element);

        return React.createElement(
            'div',
            { className: FormGenerator.getParentClassName(element, isMultiCol), key },
            React.createElement(
                formElement, {
                    type: element.type,
                    name: element.name,
                    id: element.id,
                    htmlFor: element.for,
                    placeholder: element.placeholder,
                    className: FormGenerator.getClassName(element, isMultiCol),
                    onChange: this.bindValidate(element, reference),
                    ref: reference,
                    value: element.value,
                    defaultValue: element.defaultValue,
                    defaultChecked: element.checked,
                    disabled: element.disabled || false,
                    readOnly: element.readOnly || false
                },
                this.getSecondParam(element)
            ),
            element.label && React.createElement('label', { htmlFor: element.id }, element.label)
        );
    }

    setValidationObject(element, reference) {
        // if (typeof element.validate === 'object' && element.validate.indexOf(FORM_VALIDATION.REQUIRED > -1)) {
        //     this.setState({
        //         [reference]: false
        //     });
        // } else if (typeof element.validate === 'string') {
        //     this.setState({
        //         [reference]: element.validate !== FORM_VALIDATION.REQUIRED
        //     });
        // }
    }

    bindValidate(element, reference) {
        this.setValidationObject(element, reference);

        return (event) => {
            if (typeof element.validate === 'function') {
                FormGenerator.updateElementValidate(event, element.validate(event));
            } else if (typeof element.validate === 'object') {
                element.validate.forEach(strFunction => {
                    FormGenerator.runValidateFunction(strFunction, event, element);
                });
            } else if (typeof element.validate === 'string') {
                FormGenerator.runValidateFunction(element.validate, event, element);
            }
            element.onChange && element.onChange(event, this.state);
        };
    }

    static runValidateFunction(strFunction, event, element) {
        if (typeof FormGenerator[strFunction] === 'function') {
            FormGenerator.updateElementValidate(event, FormGenerator[strFunction](event, element));
        } else {
            throw new Error(`Invalid validate function: ${strFunction}`);
        }
    }

    static updateElementValidate(event, isValid) {
        if (typeof isValid !== 'boolean') {
            throw new Error(
                'Invalid type returned by validation function. Must return a boolean indicating validity.'
            );
        }
        if (isValid) {
            FormGenerator.removeErrorClass(event);
        } else {
            FormGenerator.addErrorClass(event);
        }
    }

    static addErrorClass({ target }) {
        if (!target.classList.contains('is-invalid')) {
            target.classList.add('is-invalid');
        }
    }

    static removeErrorClass({ target }) {
        if (target.classList.contains('is-invalid')) {
            target.classList.remove('is-invalid');
        }
    }

    static getParentClassName(element, isMultiCol) {
        if (isMultiCol) {
            return element.className + ' ' + 'row-item';
        } else if (element.type === 'checkbox' || element.type === 'radio') {
            return 'form-check';
        }
        return 'form-group';
    }

    static colForm(element) {
        return typeof element.className !== 'undefined' && element.className.includes('col-');
    }

    static getClassName(element, multiForm = false) {
        let className = '';

        if (element.type === 'checkbox' || element.type === 'radio') {
            className = 'form-check-input';
        } else if (element.formElement !== 'label') {
            className = 'form-control';
        }

        if (!multiForm) {
            className += ' ' + element.className;
        }

        return className;
    }

    static getReference(key) {
        return key.name.replace(/[^\w]/g, '_').toLowerCase();
    }

    getSecondParam(element) {
        if (element.options) {
            return element.options.map((val, p) =>
                React.createElement('option', { value: p, key: p }, val));
        }
        return null;
    }

    static propTypes = {
        formName: PropTypes.string.isRequired,
        callback: PropTypes.func,
        object: PropTypes.object,
        elements: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.required,
            formElement: PropTypes.string,
            type: PropTypes.string,
            placeholder: PropTypes.string,
            className: PropTypes.string,
            htmlFor: PropTypes.string,
            onChange: PropTypes.func,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            disabled: PropTypes.bool,
            readOnly: PropTypes.bool,
            validate: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.func,
                PropTypes.arrayOf(PropTypes.string),
            ]),
        })),
        initialRefs: PropTypes.func,
        button: PropTypes.object,
        className: PropTypes.string,
    }
}

FormGenerator[FORM_VALIDATION.NUMBER] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return !isNaN(target.value);
    }
    return true;
};

FormGenerator[FORM_VALIDATION.REQUIRED] = ({ target }) => {
    return target.value.replace(' ', '') !== '';
};

FormGenerator[FORM_VALIDATION.ALPHA_NUM] = ({ target }) => {
    // TODO: implement;
    if (target.value.replace(' ', '') !== '') {
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.EMAIL] = ({ target }) => {
    // TODO: implement;
    if (target.value.replace(' ', '') !== '') {
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.NO_SPACE] = ({ target }) => {
    // TODO: implement;
    if (target.value.replace(' ', '') !== '') {
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.PHONE] = ({ target }) => {
    // TODO: implement;
    if (target.value.replace(' ', '') !== '') {
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.REGEX] = ({ target }) => {
    // TODO: implement;
    if (target.value.replace(' ', '') !== '') {
        return false;
    }
    return true;
};

export default FormGenerator;
