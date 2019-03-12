/**
 * Created by Jon on 9/21/16.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FORM_VALIDATION, VALIDATE_FUNC_SUFFIX, VALIDATE_TRANSFORM_FUNC } from '../constants';

class FormGenerator extends React.Component {
    constructor(props) {
        super(props);

        const references = {};
        const onChangeCall = {};
        const transformable = {};

        props.elements.forEach(element => {
            let isTransformable = false;

            if (typeof element.validate === 'object') {
                isTransformable = element.validate.includes(FORM_VALIDATION.PHONE);
            } else if (typeof element.validate === 'string') {
                isTransformable = element.validate === FORM_VALIDATION.PHONE;
            }
            transformable[element.name] = isTransformable;
            references[element.name] = FormGenerator.getInitialValidationValue(element, isTransformable);
            onChangeCall[element.name] = element.onChange;
        });
        this.state = {
            transformable,
            references,
            onChangeCall,
            currentEvent: null,
        };
    }

    /**
     *
     * @returns {*}
     */
    render() {
        return this.generateForm(
            this.props.elements,
            this.props.formName,
            this.props.button,
            this.props.className || 'form-section'
        );
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

    componentDidUpdate(prevProps, prevState) {
        Object.keys(this.state.references).forEach(key => {
            if (this.state.references[key].value !== prevState.references[key].value) {
                const references = { ...this.state.references };

                if (this.state.transformable[key]) {
                    references[key].value = FormGenerator.transformValue(references[key]);
                }

                this.state.onChangeCall[[key]] &&
                this.state.onChangeCall[key](this.state.currentEvent, references);
            }
        });
    }

    static transformValue(reference) {
        /**
         * for now there's only one transformable
         */

        return reference.value.replace(/\D/g, '');
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
            {
                className: formName,
                onSubmit: event => {
                    event.preventDefault();
                    this.props.onSubmit(event, this.state.references);
                }
            },

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
                    defaultValue: this.state.references[element.name].value,
                    defaultChecked: element.checked,
                    disabled: element.disabled || false,
                    readOnly: element.readOnly || false
                },
                this.getSecondParam(element)
            ),
            element.label && React.createElement('label', { htmlFor: element.id }, element.label)
        );
    }

    static getInitialValidationValue(element, isTransformable) {
        let isValid = true;
        const isArray = typeof element.validate === 'object';

        let value = typeof element.defaultValue === 'undefined' ? '' : element.defaultValue;
        const isString = typeof element.validate === 'string';

        if ((isArray && element.validate.indexOf(FORM_VALIDATION.REQUIRED > -1) || isString &&
            element.validate === FORM_VALIDATION.REQUIRED) &&
            typeof element.defaultValue === 'undefined' || element.defaultValue === '') {
            isValid = false;
        }
        if (isTransformable && (typeof element.defaultValue !== 'undefined' || element.defaultValue !== '')) {
            if (isArray) {
                element.validate.forEach(method => {
                    if (typeof FormGenerator[method + VALIDATE_TRANSFORM_FUNC] === 'function') {
                        value = FormGenerator[method + VALIDATE_TRANSFORM_FUNC](value);
                    }
                });
            } else if (isString) {
                value = FormGenerator[element.validate + VALIDATE_TRANSFORM_FUNC](value);
            }
        }
        return {
            isValid,
            value,
        };
    }

    setElementState(key, isValid, event) {
        let value = '';

        if (event.target.type === 'radio' || event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }

        const currentReferences = { ...this.state.references, [key]: {
            isValid,
            value,
        }};

        event.persist();

        this.setState({
            references: currentReferences,
            currentEvent: event,
        });
    }

    bindValidate(element) {
        return (event) => {
            if (typeof element.validate === 'function') {
                const isValid = element.validate(event);

                this.setElementState(element.name, isValid, event);
                FormGenerator.updateElementValidate(event, isValid);
            } else if (typeof element.validate === 'object') {
                /**
                 |_____________________________________________________________________________
                 | when we have many validation methods to run, we want to run required        |
                 | last since other methods will not validate if empty                         |
                 | @type {boolean}                                                             |
                 |_____________________________________________________________________________|
                 */
                let hasRequiredFunc = false;

                let isValid = true;

                element.validate.forEach(strFunction => {
                    if (strFunction === FORM_VALIDATION.REQUIRED) {
                        hasRequiredFunc = true;
                    } else {
                        isValid = this.runValidateFunction(strFunction, event, element);

                        if (!isValid) {
                            return;
                        }
                    }
                });
                if (hasRequiredFunc && isValid) {
                    this.runValidateFunction(FORM_VALIDATION.REQUIRED, event, element);
                }
            } else if (typeof element.validate === 'string') {
                this.runValidateFunction(element.validate, event, element);
            } else {
                this.setElementState(element.name, true, event);
            }
        };
    }

    runValidateFunction(strFunction, event, element) {
        let extraArgs = [];

        if (strFunction.indexOf(':') > -1) {
            const parts = strFunction.split(':');

            strFunction = parts.shift();
            extraArgs = parts;
        }

        if (typeof FormGenerator[strFunction + VALIDATE_FUNC_SUFFIX] === 'function') {
            const isValid = FormGenerator[strFunction + VALIDATE_FUNC_SUFFIX](event, extraArgs);

            this.setElementState(element.name, isValid, event);
            FormGenerator.updateElementValidate(event, isValid);
            return isValid;
        }

        throw new Error(`Invalid validate function: ${strFunction}`);
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

        if (!multiForm && element.className) {
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
        onSubmit: PropTypes.func,
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

    static get alpha_num_re() {
        return '^[a-zA-Z0-9_]*$';
    }

    static get email_re() {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    }

    static get phone_re() {
        return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    }
}

FormGenerator[FORM_VALIDATION.NUMBER + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return !isNaN(target.value);
    }
    return true;
};

FormGenerator[FORM_VALIDATION.REQUIRED + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    return target.value.replace(' ', '') !== '';
};

FormGenerator[FORM_VALIDATION.ALPHA_NUM + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return new RegExp(FormGenerator.alpha_num_re).test(target.value);
    }
    return true;
};

FormGenerator[FORM_VALIDATION.EMAIL + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        return FormGenerator.email_re.test(String(target.value).toLowerCase());
    }
    return true;
};

FormGenerator[FORM_VALIDATION.NO_SPACE + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    return target.value.indexOf(' ') === -1;
};

FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_FUNC_SUFFIX] = ({ target }) => {
    if (target.value.replace(' ', '') !== '') {
        if (FormGenerator.phone_re.test(target.value)) {
            target.value = FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_TRANSFORM_FUNC](target.value);
            return true;
        }
        return false;
    }
    return true;
};

FormGenerator[FORM_VALIDATION.PHONE + VALIDATE_TRANSFORM_FUNC] = (value) => {
    return value.replace(FormGenerator.phone_re, '($1) $2-$3');
};

FormGenerator[FORM_VALIDATION.REGEX + VALIDATE_FUNC_SUFFIX] = ({ target }, regex) => {
    if (target.value.replace(' ', '') !== '') {
        return new RegExp(regex.pop()).test(target.value);
    }
    return true;
};

/**
 * Call like: validate: 'required:min:max', i.e. required:4:10 - the second arg is optional.
 *
 * @param {object} target
 * @param {array} args
 * @return {boolean}
 */
FormGenerator[FORM_VALIDATION.LENGTH + VALIDATE_FUNC_SUFFIX] = ({ target }, args) => {
    if (target.value.replace(' ', '') !== '') {
        if (target.length < Number(args[0])) {
            return false;
        }
        if (args[1] && target.length > Number(args[1])) {
            return false;
        }
    }
    return true;
};

export default FormGenerator;
