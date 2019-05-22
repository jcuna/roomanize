/**
 * Created by Jon on 2019-05-21.
 */

import React from 'react';
import PropTypes from 'prop-types';

const FontAwesome = (props) => {
    return (
        <span className={ props.className } onClick={ props.onClick }>
            <i className={ `fas fa-${ props.type }` } data-id={ props.dataId }/>
        </span>
    );
};

FontAwesome.propTypes = {
    dispatch: PropTypes.func,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
    dataId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

FontAwesome.defaultProps = {
    className: '',
};

export default FontAwesome;
