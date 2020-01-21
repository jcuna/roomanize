/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import '../../../css/messages/messages.scss';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '../../constants';
import { formatDateEs } from '../../utils/helpers';
import Message from './Message';
import { toggleContainer } from '../../actions/appActions';
import Spinner from '../../utils/Spinner';

export default class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.props.dispatch(toggleContainer());
    }

    render() {
        return (
            <div className='messages-container'>
                <div className='widget'>
                    <div className='widget-child'>
                        <div className='widget messages-wrapper'>
                            <section className='message-list'><ul>{this.getMessages(this.props.user)}</ul></section>
                            <section className='message-reader'>{this.getMessageArea(this.props.user)}</section>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    getMessages({ messages }) {
        const { match } = this.props;
        return messages.list.map((item, key) => {
            const classNameList = [];
            if (typeof match.params.message_id === 'undefined' && key === 0 ||
                Number(match.params.message_id) === item.id) {
                classNameList.push('selected');
            }
            if (item.read) {
                classNameList.push('read');
            }
            return <li key={ key } className={ classNameList.join(' ') }>
                <Link to={ `${ ENDPOINTS.MESSAGES_URL }/${ item.id }` }>
                    { item.subject }
                    <span className='date'>{ formatDateEs(new Date(item.date), true) }</span>
                </Link>
            </li>;
        });
    }

    getMessageArea({ messages }) {
        let message = messages.list.filter(item => item.id === Number(this.props.match.params.message_id)).pop();
        if (typeof message === 'undefined') {
            message = messages.list[0];
        }
        if (typeof message !== 'undefined') {
            return <div><Message { ...message } dispatch={ this.props.dispatch }/></div>;
        }
        return <Spinner/>;
    }

    componentWillUnmount() {
        this.props.dispatch(toggleContainer());
    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        match: PropTypes.object,
    };
}
