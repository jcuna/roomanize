/**
 * Created by Jon on 2019-02-28.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Autocomplete from '../../utils/Autocomplete';
import { fetchRooms, searchRooms } from '../../actions/roomActions';
import { STATUS } from '../../constants';
import { afterPause, searchArray } from '../../utils/helpers';
import { fetchTimeIntervals } from '../../actions/projectActions';

export default class AgreementForm extends React.Component {
    constructor(props) {
        super(props);
        let rooms = [];

        if (props.user.attributes.preferences.default_project === null) {
            rooms = [{ id: 0, name: 'Seleccione un proyecto' }];
        }

        this.state = {
            loadingRooms: false,
            rooms,
        };

        this.inputChanged = this.inputChanged.bind(this);
        this.roomInputChanged = this.roomInputChanged.bind(this);
        this.selectRoom = this.selectRoom.bind(this);
        this.fetchNextRoomPage = this.fetchNextRoomPage.bind(this);
        this.fetchPreviousRoomPage = this.fetchPreviousRoomPage.bind(this);

        this.props.dispatch(fetchRooms(1));
        if (props.projects.timeIntervals.length === 0) {
            props.dispatch(fetchTimeIntervals());
        }
    }

    render() {
        const { agreement, rooms } = this.props;
        let { data } = rooms;

        if (this.state.rooms.length > 0) {
            data = {
                list: this.state.rooms,
                total_pages: 1,
                page: 1,
            };
        }

        return <FormGenerator
            formName='agreement-form'
            onSubmit={ this.props.onSubmit }
            button={ this.props.button }
            sections={ [
                {
                    title: 'Unidad/Habitación',
                    className: 'row',
                    elementsWrapperClass: 'col-12',
                    elements: [
                        <div key={ 0 } className='col-12 row-item'>
                            <Autocomplete
                                loading={ rooms.status === STATUS.TRANSMITTING || this.state.loadingRooms }
                                name='room'
                                placeholder='Seleccione Nombre De Habitación'
                                onChange={ this.roomInputChanged }
                                className='form-control'
                                onSelect={ this.selectRoom }
                                items={ data.list.map(item => ({ key: item.id, label: item.name })) }
                                total_pages={ Number(data.total_pages) }
                                page={ Number(data.page) }
                                onNext={ this.fetchNextRoomPage }
                                onPrevious={ this.fetchPreviousRoomPage }
                            />
                        </div>,
                    ],
                },
                {
                    title: 'Referencias',
                    className: 'row',
                    elementsWrapperClass: 'col-12',
                    cardBodyClass: 'row',
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
                {
                    wrapper: {
                        className: 'row',
                        sections: [
                            {
                                title: 'Intervalo de pago',
                                className: 'col-4',
                                elements: [
                                    {
                                        name: 'interval',
                                        formElement: 'select',
                                        onChange: this.inputChanged,
                                        defaultValue: 0,
                                        options: this.getTimeIntervalOptions(),
                                        validate: 'required',
                                    },
                                ]
                            },
                            {
                                title: 'Precio De Arrendamiento',
                                className: 'col-4',
                                elements: [
                                    {
                                        name: 'rate',
                                        placeholder: 'Precio',
                                        onChange: this.inputChanged,
                                        validate: ['number', 'required']
                                    },
                                ]
                            },
                            {
                                title: 'Fecha De Entrada',
                                className: 'col-4',
                                elements: [
                                    {
                                        name: 'date',
                                        type: 'date',
                                        placeholder: 'Fecha',
                                        onChange: this.inputChanged,
                                        validate: ['required']
                                    },
                                ]
                            },
                        ]
                    }
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

    selectRoom(room) {
        this.setState({ data: [] });
        console.log(room);
    }

    inputChanged(validate) {
        console.log(validate);
    }

    roomInputChanged({ target }) {
        if (target.value !== '') {
            const result = searchArray(this.props.rooms.data.list, target.value, ['name']);
            if (result.length > 0) {
                this.setState({ rooms: result });
            } else {
                this.setState({ loadingRooms: true });
                afterPause(() => this.props.dispatch(
                    searchRooms(target.value, (data) => this.setState({
                        rooms: data.list.length > 1 ? data.list :
                            [{ id: 0, name: 'No se encontraron resultados' }],
                        loadingRooms: false
                    })))
                );
            }
        } else {
            this.setState({ rooms: [] });
        }
    }

    getTimeIntervalOptions() {
        const options = [];

        options[0] = 'Intervalo de Pago';

        this.props.projects.timeIntervals.forEach(
            item => options[item.id] = item.interval);
        return options;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        onSubmit: PropTypes.func,
        button: PropTypes.object,
        agreement: PropTypes.object,
        rooms: PropTypes.object,
        projects: PropTypes.object,
        user: PropTypes.object,
    };
}
