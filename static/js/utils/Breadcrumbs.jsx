/**
 * Created by Jon on 2019-01-07.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/es/Link';

export default class Breadcrumbs extends React.Component {
    render() {
        const { title, match } = this.props;

        const parts = match.path.split('/');
        const items = [];

        let urlBuild = '/';

        let itemsLast = -1;

        parts.forEach((item, k) => {
            const cleanItem = item.replace(/[:?]/g, '');

            if (item !== '' && !(cleanItem in match.params)) {
                urlBuild += item;
                itemsLast++;
                items.push({ name: item.charAt(0).toUpperCase() + item.slice(1), link: urlBuild, key: k });
            } else if (cleanItem in match.params && typeof match.params[cleanItem] !== 'undefined') {
                itemsLast++;
            }
        });

        return (
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to='/'>Home</Link></li>
                    { items.map((item, key) =>
                        <li key={ item.key } className="breadcrumb-item">
                            { itemsLast === key && item.name }
                            { itemsLast !== key && <Link to={ item.link }>{ item.name }</Link> }
                        </li>
                    )}
                    { title && <li className="breadcrumb-item active" aria-current="page">{ title }</li>}
                </ol>
            </nav>
        );
    }

    static propTypes = {
        match: PropTypes.object,
        title: PropTypes.string
    };
}
