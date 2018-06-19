/**
 * Created by Jon on 5/26/18.
 */

import React from 'react';

import PropTypes from 'prop-types';

export default class Checkbox extends React.Component {

    render() {
        return <div className='checkbox-wrapper' onClick={() => {
            let checkboxObj = {
                name: this.props.name,
                checked: !this.props.checked
            };
            if (this.props.id !== undefined) {
                checkboxObj['id'] = this.props.id
            }
            if (this.props.value !== undefined) {
                checkboxObj['value'] = this.props.value;
            }
            this.props.onChange(checkboxObj);
        }}><span className={
            `checkbox ${this.props.checked ? 'ticked' : ''}`
        }/><span className="checkbox-label">{this.props.label}</span></div>
    }

    static defaultProps = {
        checked: false
    };

    static propTypes = {
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        checked: PropTypes.bool,
        label: PropTypes.string
    }
}