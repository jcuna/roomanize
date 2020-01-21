/**
 * Created by Jon on 1/18/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { markMessageRead } from '../../actions/userActions';
import { friendlyDateEs, formatAMPM, toLocalTimezone } from '../../utils/helpers';

export default class Message extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.read) {
            this.props.dispatch(markMessageRead(this.props.id));
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id && !this.props.read) {
            this.props.dispatch(markMessageRead(this.props.id));
        }
    }

    render() {
        const date = new Date(this.props.date);
        const date_time = new Date(this.props.date);
        toLocalTimezone(date_time);
        return (
            <section className='message'>
                <div className='subject'>
                    <span className='date'>{formatAMPM(date_time) + ' ' + friendlyDateEs(date) }</span>
                    <h4>{this.props.subject}</h4>
                </div>
                <iframe srcDoc={ this.props.message }/>
            </section>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        id: PropTypes.number,
        subject: PropTypes.string,
        message: PropTypes.string,
        read: PropTypes.bool,
        date: PropTypes.string,
    };
}
