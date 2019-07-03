/**
 * Created by Jon on 2019-05-21.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = (props) => {
    return (
        <div className='row'>
            <button { ...props }
                className={ props.className ||
                'btn' + (props.size.length > 0 ? ` btn-${ props.size }` : '') + ` btn-${props.type}` }
                onClick={ props.onClick }
            >{ props.value }</button>
        </div>
    );
};

Button.propTypes = {
    dispatch: PropTypes.func,
    type: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
    value: PropTypes.string,
    size: PropTypes.string,
};

Button.defaultProps = {
    type: 'success',
    size: '',
    value: 'Submit',
};

export default Button;
