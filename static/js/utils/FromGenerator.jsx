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
            this.props.button
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
     * @returns {*}
     */
    generateForm(elements, formName, button) {
        return React.createElement(
            'form',
            { className: formName, onSubmit: this.props.callback },
            elements.map((b, k) => {
                if (React.isValidElement(b)) {
                    return b;
                }

                const formElement = typeof b.formElement === 'undefined' ? 'input' : b.formElement;
                const reference = FormGenerator.getReference(b);

                return React.createElement(
                    'div',
                    { className: FormGenerator.getParentClassName(b), key: k },
                    React.createElement(formElement, {
                        type: b.type,
                        name: b.name,
                        id: b.id,
                        htmlFor: b.for,
                        placeholder: b.placeholder,
                        className: FormGenerator.getClassName(b),
                        onChange: b.onChange,
                        ref: reference,
                        value: b.value,
                        defaultValue: b.defaultValue,
                        defaultChecked: b.checked,
                        disabled: b.disabled || false,
                        readOnly: b.readOnly || false
                    },
                    this.getSecondParam(b)),
                    b.label && React.createElement('label', { htmlFor: b.id }, b.label)
                );
            }),
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

    static getParentClassName(element) {
        if (element.type === 'checkbox' || element.type === 'radio') {
            return 'form-check';
        }
        return 'form-group';
    }

    static getClassName(element) {
        let className = '';

        if (element.type === 'checkbox' || element.type === 'radio') {
            className = 'form-check-input';
        } else if (element.formElement !== 'label') {
            className = 'form-control';
        }

        if (typeof element.className !== 'undefined') {
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
                React.createElement('option', { value: val, key: p }, val));
        // } else if (element.formElement === 'label') {
        //     return element.value;
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
            onChange: PropTypes.func,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            disabled: PropTypes.bool,
            readOnly: PropTypes.bool,
        })),
        initialRefs: PropTypes.func,
        button: PropTypes.object
    }
}
