/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React, { Component } from 'react';
import FormGenerator from '../../utils/FromGenerator';
import PropTypes from 'prop-types';
import {
    clearSelectedRoom,
    createRoom,
    editRoom,
    fetchRoom,
    fetchRoomHistory,
    fetchRooms,
    selectRoom
} from '../../actions/roomActions';
import { notifications } from '../../actions/appActions';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../constants';
import Breadcrumbs from '../../utils/Breadcrumbs';
import Spinner from '../../utils/Spinner';
import { Link } from 'react-router-dom';
import Table from '../../utils/Table';
import { formatDateEs } from '../../utils/helpers';
import { hasAccess } from '../../utils/config';
import Paginate from '../../utils/Paginate';
import { getAgreementBalance } from '../../actions/receiptsActions';

export default class RoomForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: true,
            ...RoomForm.getStateFromProps(props),
            page: 1,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.switchPage = this.switchPage.bind(this);

        const { params } = props.match;

        if (typeof params.room_id !== 'undefined' && this.state.id === 0 &&
            props.rooms.status !== STATUS.TRANSMITTING) {
            props.dispatch(fetchRoom(params.room_id, () => {
                props.history.push('/error/404');
            }));
        }
        if (typeof params.room_id !== 'undefined' && hasAccess(ENDPOINTS.ROOMS_HISTORY_URL, ACCESS_TYPES.READ)) {
            props.dispatch(fetchRoomHistory(params.room_id, this.state.page, ({ list }) => {
                if (hasAccess(ENDPOINTS.BALANCE_PAYMENTS_URL, ACCESS_TYPES.WRITE)) {
                    list.forEach(agreement => {
                        if (agreement.agreement_terminated_on === null) {
                            props.dispatch(getAgreementBalance(agreement.agreement_id));
                        }
                    });
                }
            }));
        }
    }

    static getStateFromProps({ rooms }) {
        return {
            button: { value: rooms.selectedRoom.id ? 'Editar' : 'Agregar', disabled: true },
            name: rooms.selectedRoom.name || '',
            description: rooms.selectedRoom.description || '',
            id: rooms.selectedRoom.id || 0,
            project_id: rooms.selectedRoom.project_id || 0,
            picture: rooms.selectedRoom.picture || '',
        };
    }

    componentWillUnmount() {
        this.props.dispatch(clearSelectedRoom());
    }

    getRoomsForm() {
        return <FormGenerator { ...{
            className: 'form-group row',
            formName: 'new-room',
            button: this.state.button,
            elements: [
                {
                    className: 'col-6',
                    type: 'text',
                    placeholder: 'Numero/Nombre de Habitación',
                    onChange: this.onInputChange,
                    name: 'room-name',
                    defaultValue: this.state.name,
                    validate: 'required',
                },
                {
                    className: 'col-6',
                    type: 'text',
                    placeholder: 'Notas',
                    onChange: this.onInputChange,
                    name: 'notes',
                    defaultValue: this.state.description,
                },
            ],
            onSubmit: this.handleSubmit,
        } }/>;
    }

    getMainRender() {
        const canEditRoom = hasAccess(ENDPOINTS.ROOMS_URL, ACCESS_TYPES.WRITE);
        if (canEditRoom) {
            return this.getRoomsForm();
        }

        return <div className='card text-center'>
            <div className="card-header">
                Habitacion
            </div>
            <div className='card-body'>
                <h3 className='card-title'>{ this.state.name }</h3>
                <p>{ this.state.description }</p>
            </div>
        </div>;
    }

    render() {
        const { match, rooms, receipts } = this.props;
        const creating = typeof match.params.room_id === 'undefined';

        if (!creating && this.state.id === 0) {
            return <Spinner/>;
        }

        return <div>
            <Breadcrumbs { ...this.props } title={ creating ? 'Nuevo' : 'Editar' }/>
            <section className='widget'>
                { this.getMainRender() }
                { match.params.room_id && <Link
                    className='btn btn-sm btn-success'
                    to={ `${ENDPOINTS.RECEIPTS_URL}/habitacion/${ match.params.room_id }` }
                >Historial de Recibos</Link> }
            </section>
            { this.getRoomHistory(rooms.selectedRoom.rental_history, receipts) }
        </div>;
    }

    getPaginator(total_pages) {
        return total_pages > 1 && <Paginate
            total_pages={ total_pages }
            onPageChange={ this.switchPage }
            initialPage={ this.state.page }
        />;
    }

    switchPage(number) {
        this.setState({ page: number });
    }

    getRoomHistory({ list, total_pages }, { selectedBalance }) {
        const canEditTenant = hasAccess(ENDPOINTS.TENANTS_URL, ACCESS_TYPES.READ);
        return list.length > 0 && <section className='widget room-history'>
            <h3>Historial de renta</h3>
            { list.map((history, i) => {
                const rows = [
                    [
                        'Inquilino',
                        RoomForm.getTenantLine(history, canEditTenant, i)
                    ],
                    [
                        'Estatus',
                        history.agreement_terminated_on &&
                        'Terminado desde ' + formatDateEs(new Date(history.agreement_terminated_on)) ||
                        <span className='success'>Activo</span>
                    ]
                ];
                if (selectedBalance.agreement_id === history.agreement_id) {
                    const due_cn = Number(selectedBalance.amount_due) > 0 ? 'urgent' : 'success';
                    rows.push(['Dia De Pago', formatDateEs(new Date(selectedBalance.due_date))]);
                    rows.push(['Ciclo de Pago', history.interval]);
                    rows.push(['Arrendamiento', `$RD ${history.rate}`]);
                    rows.push(['Balance', `$RD ${selectedBalance.balance}`]);
                    rows.push([
                        'Deuda',
                        <span key={ i } className={ due_cn }>{ `$RD ${selectedBalance.amount_due}` }</span>
                    ]);
                }

                return <section key={ i } className='room-tenant'>
                    <Table numberedRows={ false } rows={ rows }/>
                </section>;
            })}
            { this.getPaginator(total_pages) }
        </section>;
    }

    static getTenantLine(tenant, canEdit, key) {
        if (canEdit) {
            return (
                <Link
                    key={ key } to={ `${ ENDPOINTS.TENANTS_URL }/editar/${ tenant.tenant_id }` }>{ tenant.tenant_name }
                </Link>);
        }
        return tenant.tenant_name;
    }

    handleSubmit(event, validation) {
        const room = {
            project_id: this.props.user.attributes.preferences.default_project,
            name: validation['room-name'].value,
            description: validation.notes.value,
            picture: '',
        };

        let action = createRoom;

        let msg = 'agregada';

        if (this.state.id !== 0) {
            msg = 'actualizada';
            room.id = this.state.id;
            action = editRoom;
        }

        this.props.dispatch(action(
            room,
            (resp) => {
                this.props.dispatch(notifications({
                    type: ALERTS.SUCCESS,
                    message: 'Habitacion ' + msg + ' correctamente.',
                }));
                room.id = resp.id || room.id;
                this.props.dispatch(selectRoom(room));
                this.setState(room);
                this.props.dispatch(fetchRooms(this.props.rooms.data.page));
            }, (error) => {
                this.props.dispatch(notifications({
                    type: ALERTS.DANGER,
                    message: error.status === 400 ? error.resp.error : GENERIC_ERROR,
                }));
            }),
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.pathname === `${ENDPOINTS.ROOMS_URL}/nuevo` &&
            prevState.id !== this.state.id) {
            this.props.history.push(`${ENDPOINTS.ROOMS_URL}/editar/${this.props.rooms.selectedRoom.id}`);
        }

        if (prevProps.rooms.selectedRoom.id !== this.props.rooms.selectedRoom.id) {
            this.setState({ ...RoomForm.getStateFromProps(this.props) });
        }
        if (prevState.page !== this.state.page) {
            this.props.dispatch(fetchRoomHistory(this.props.match.params.room_id, this.state.page));
        }
    }

    onInputChange(e, validation) {
        if (validation['room-name'].isValid) {
            this.formIsValid(true);
        } else {
            this.formIsValid(false);
        }
    }

    formIsValid(isIt) {
        this.setState({
            errors: isIt,
            button: { value: this.props.rooms.selectedRoom.id ? 'Editar' : 'Agregar', disabled: !isIt },
        });
    }

    static propTypes = {
        dispatch: PropTypes.func,
        projects: PropTypes.object,
        user: PropTypes.object,
        history: PropTypes.object,
        match: PropTypes.object,
        location: PropTypes.object,
        rooms: PropTypes.object,
        receipts: PropTypes.object,
    };
}
