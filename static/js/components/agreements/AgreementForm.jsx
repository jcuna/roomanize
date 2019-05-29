/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Autocomplete from '../../utils/Autocomplete';
import { fetchRooms } from '../../actions/roomActions';
import { STATUS } from '../../constants';

export default class AgreementForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingRooms: false,
            rooms: [],
            pagination: {},
        };

        this.inputChanged = this.inputChanged.bind(this);
        this.selectRoom = this.selectRoom.bind(this);
        this.fetchNextRoomPage = this.fetchNextRoomPage.bind(this);
        this.fetchPreviousRoomPage = this.fetchPreviousRoomPage.bind(this);

        this.props.dispatch(fetchRooms(1));
    }

    render() {
        const { agreement, rooms } = this.props;
        return <FormGenerator
            formName='agreement-form'
            onSubmit={ this.props.onSubmit }
            button={ this.props.button }
            className={ 'form-group row' }
            sections={ [
                {
                    title: 'Unidad/Habitación',
                    elements: [
                        <div key={ 0 } className='col-12 row-item'>
                            <Autocomplete
                                loading={ rooms.status === STATUS.TRANSMITTING }
                                name='room'
                                placeholder='Seleccione Nombre De Habitación'
                                onChange={ this.inputChanged }
                                className='form-control'
                                onSelect={ this.selectRoom }
                                items={ rooms.data.list.map(item => ({ key: item.id, label: item.name })) }
                                total_pages={ Number(rooms.data.total_pages) }
                                page={ Number(rooms.data.page) }
                                onNext={ this.fetchNextRoomPage }
                                onPrevious={ this.fetchPreviousRoomPage }
                            />
                        </div>,
                    ],
                },
                {
                    title: 'Referencias',
                    elements: [
                        {
                            name: 'reference1',
                            placeholder: 'Teléfono I *',
                            onChange: this.inputChanged,
                            defaultValue: agreement && agreement.reference1 || '',
                            validate: ['required', 'phone'],
                            className: 'col-4',
                        },
                        {
                            name: 'reference2',
                            placeholder: 'Teléfono II',
                            onChange: this.inputChanged,
                            defaultValue: agreement && agreement.reference2 || '',
                            validate: ['phone'],
                            className: 'col-4',
                        },
                        {
                            name: 'reference3',
                            placeholder: 'Teléfono III',
                            onChange: this.inputChanged,
                            defaultValue: agreement && agreement.reference2 || '',
                            validate: ['phone'],
                            className: 'col-4',
                        },
                    ],
                },
            ] }
        />;
    }

    fetchNextRoomPage() {
        this.props.dispatch(fetchRooms(Number(this.props.rooms.data.page) + 1));
    }

    fetchPreviousRoomPage() {
        this.props.dispatch(fetchRooms(Number(this.props.rooms.data.page) - 1));
    }

    selectRoom(e) {
        console.log(e);
    }

    inputChanged() {

    }

    static propTypes = {
        dispatch: PropTypes.func,
        onSubmit: PropTypes.func,
        button: PropTypes.object,
        agreement: PropTypes.object,
        rooms: PropTypes.object,
    };
}
