/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '../utils/FontAwesome';

const ErrorPage = (props) => {
    return (
        <div className='card'>
            <div className='card-header'>
                <FontAwesome type='bomb'/> Error { props.type }
            </div>
            <div className='card-block'>
                <blockquote className='card-blockquote'>
                    <p>{ props.textMap[props.type] }</p>
                </blockquote>
            </div>
        </div>
    );
};

ErrorPage.defaultProps = {
    type: 404,
    textMap: {
        404: 'La página solicitada no existe.',
        403: 'No Tienes accesso al recurso solicitado',
        400: 'La solicitud no pudo ser completada, por favor verifica y trata de nuevo'
    },
};

ErrorPage.propTypes = {
    type: PropTypes.number,
    textMap: PropTypes.object,
    customMessage: PropTypes.string,
};

export default ErrorPage;
