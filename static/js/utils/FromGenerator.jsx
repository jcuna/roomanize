/**
 * Created by Jon on 9/21/16.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class FormGenerator extends React.Component {
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
                    onChange: element.onChange,
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
        let reference = null;

        if (typeof key.name !== 'undefined') {
            reference = key.name.replace(/[^\w]/g, '_').toLowerCase();
        } else if (typeof key.placeholder !== 'undefined') {
            reference = key.placeholder.replace(/[^\w]/g, '_').toLowerCase();
        }

        return reference;
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
        })),
        initialRefs: PropTypes.func,
        button: PropTypes.object,
        className: PropTypes.string,
    }
}
