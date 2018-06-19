/**
 * Created by Jon on 9/21/16.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class FormGenerator extends React.Component {
    constructor(props) {
        super();

        this.state = props;
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps);
    }

    /**
     *
     * @returns {XML}
     */
    render() {
        const form = this.generateForm(
            this.state.elements,
            this.state.formName,
            this.state.button
        );

        return (<div>{form}</div>);
    }

    /**
     * pass refs down to callee
     */
    componentDidMount() {
        if (typeof this.state.object !== 'undefined') {
            this.state.object.refs = this.refs;
        }
        if (typeof this.props.initialRefs !== 'undefined') {
            this.props.initialRefs(this.state.object.refs);
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
        return React.createElement('form', {className: formName, onSubmit: this.state.callback},
            elements.map((b, k) => {
                if (typeof b.$$typeof !== 'undefined') {
                    return b;
                }
                const formElement = typeof b.formElement === 'undefined' ? 'input' : b.formElement;
                const reference = FormGenerator.getReference(b);
                const className = 'form-control';

                return React.createElement('div', { className: 'form-group', key: k },
                    React.createElement(formElement, {
                        type: b.type,
                        name: b.name,
                        placeholder: b.placeholder,
                        className: typeof b.className === 'undefined' ? className : `${className} ${b.className}`,
                        onChange: b.onChange,
                        ref: reference,
                        value: b.value,
                        defaultValue: b.defaultValue,
                        disabled: b.disabled || false,
                        readOnly: b.readOnly || false
                    },
                    b.options && b.options.map((val, p) => React.createElement('option', { value: val, key: p }, val))
                    )
                );
            }),
            typeof button !== 'undefined' &&
            React.createElement('div', { className: 'form-group' },
                React.createElement(
                    'button', { ...button, className: `btn btn-${button.type || 'primary'}` },
                    button.value || 'Submit'
                )
            )
        );
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

    static propTypes = {
        formName: PropTypes.string.isRequired,
        callback: PropTypes.func,
        object: PropTypes.object,
        elements: PropTypes.array,
        initialRefs: PropTypes.func,
    }
}
