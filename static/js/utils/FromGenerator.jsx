/**
 * Created by Jon on 9/21/16.
 */

export default class FormGenerator extends React.Component {
    constructor(props) {
        super(props);

        this.state = props;

        // this.state.formName = this.state.formName || 'form';
        // this.state.buttonValue = this.state.buttonValue || 'submit';

        if (typeof this.state.elements === undefined || typeof this.state.elements !== 'object') {
            throw "Invalid elements property";
        } else if (typeof this.state.formName === undefined) {
            throw "Must specify formName";
        }
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps);
    }

    /**
     *
     * @returns {XML}
     */
    render() {
        let form = this.generateForm(
            this.state.elements,
            this.state.formName,
            this.state.buttonValue
        );
        return (<div>{form}</div>);
    }

    /**
     * pass refs down to callee
     */
    componentDidMount() {
        if (typeof this.state.object !== "undefined") {
            this.state.object.refs = this.refs;
        }
    }

    /**
     * @private
     *
     * @param elements
     * @param formName
     * @param buttonValue
     * @returns {*}
     */
    generateForm(elements, formName, buttonValue) {
        return React.createElement('form', {className: formName, onSubmit: this.state.callback},
            elements.map((b, k) => {
                if (b.$$typeof !== undefined) {
                    return b;
                }
                let formElement = b.formElement === undefined ? 'input' : b.formElement;
                let reference = this.getReference(b);
                let className = 'form-control';

                return React.createElement('div', {className: 'form-group', key: k},
                    React.createElement(formElement, {
                            type: b.type,
                            name: b.name,
                            placeholder: b.placeholder,
                            className: b.className === undefined ? className : `${className} ${b.className}`,
                            onChange: b.onChange,
                            ref: reference,
                            value: b.value,
                            defaultValue: b.defaultValue
                        },
                        b.options && b.options.map((val, k) => React.createElement('option', { value: val, key: k }, val))
                    )
                )
            }),
            React.createElement('div', {className: 'form-group'},
                React.createElement(
                    'button', {
                        type: 'submit',
                        className: "btn btn-primary",
                    },
                    buttonValue
                )
            )
        )
    }

    getReference(key) {
        let reference = null;
        if (key.placeholder !== undefined) {
            reference = key.placeholder.replace(/[^\w]/g, '_').toLowerCase();
        } else if (key.name !== undefined) {
            reference = key.name.replace(/[^\w]/g, '_').toLowerCase();
        }

        return reference;
    }
}