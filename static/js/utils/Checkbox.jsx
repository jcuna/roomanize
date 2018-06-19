/**
 * Created by Jon on 5/26/18.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = (props) => {
    return <div className='checkbox-wrapper' onClick={ () => {
        const checkboxObj = {
            name: props.name,
            checked: !props.checked
        };

        if (typeof props.id !== 'undefined') {
            checkboxObj.id = props.id;
        }
        if (typeof props.value !== 'undefined') {
            checkboxObj.value = props.value;
        }
        props.onChange(checkboxObj);
    } }><span className={ `checkbox ${props.checked ? 'ticked' : '' }`
        }/><span className="checkbox-label">{props.label}</span></div>;
};

Checkbox.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool,
    label: PropTypes.string,
    id: PropTypes.number,
    value: PropTypes.number
};

Checkbox.defaultProps = {
    checked: false
};

export default Checkbox;
