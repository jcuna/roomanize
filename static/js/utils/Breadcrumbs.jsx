/**
 * Created by Jon on 2019-01-07.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { clearNotifications } from '../actions/appActions';
import FontAwesome from './FontAwesome';

export default class Breadcrumbs extends React.Component {
    render() {
        const { title, match, dispatch } = this.props;

        const parts = match.url.split('/');
        const items = [];

        let urlBuild = '/';

        let itemsLast = -1;

        parts.forEach((item, k) => {
            let isParam = false;
            let itemName = item;

            Object.values(match.params).forEach(param => {
                if (this.props.paramValues.includes(item)) {
                    if (typeof this.props.paramNames[this.props.paramValues.indexOf(item)] === 'string') {
                        itemName = this.props.paramNames[this.props.paramValues.indexOf(item)];
                    }
                } else if (param === item) {
                    isParam = true;
                }
            });

            if (item !== '' && !isParam && match.url.split('/').pop() !== item) {
                if (itemsLast > 0) {
                    urlBuild += '/';
                }
                urlBuild += item;
                itemsLast++;
                items.push({ name: itemName.charAt(0).toUpperCase() + itemName.slice(1), link: urlBuild, key: k });
            } else {
                itemsLast++;
            }
        });

        return (
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to='/'><FontAwesome type='home'/></Link></li>
                    { items.map((item, key) =>
                        <li key={ item.key } className="breadcrumb-item">
                            { itemsLast === key && item.name }
                            { itemsLast !== key && <Link
                                onClick={ () => dispatch(clearNotifications()) }
                                to={ item.link }>{ item.name }</Link>
                            }
                        </li>
                    )}
                    { title && <li className="breadcrumb-item active" aria-current="page">{ title }</li>}
                </ol>
            </nav>
        );
    }

    static propTypes = {
        match: PropTypes.object,
        history: PropTypes.object,
        dispatch: PropTypes.func,
        title: PropTypes.string,
        paramValues: PropTypes.array,
        paramNames: PropTypes.array
    };
    static defaultProps = {
        paramValues: [],
        paramNames: [],
    }
}
