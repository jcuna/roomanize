/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../utils/Checkbox';
import FormGenerator from '../../utils/FromGenerator';
import {
    clearProjectEditing,
    createProject,
    editProject,
    fetchProjects,
    updateProject,
} from '../../actions/projectActions';
import Link from 'react-router-dom/es/Link';
import { hasAccess } from '../../utils/config';
import { hideOverlay, showOverlay } from '../../actions/appActions';
import { STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import Breadcrumbs from '../../utils/Breadcrumbs';

export default class Project extends React.Component {
    constructor(props) {
        super(props);

        this.state = { button: { value: 'Agregar', disabled: true }, project: {}};

        if (typeof props.match.params.project_id !== 'undefined' && props.projects.status === STATUS.COMPLETE) {
            const project = this.getEditingProject(props);

            if (project) {
                props.dispatch(editProject(project));
            }
        }

        this.selectCheckBox = this.selectCheckBox.bind(this);
        this.validateFields = this.validateFields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate({ projects, match, dispatch }) {
        if (typeof match.params.project_id !== 'undefined' &&
            typeof this.props.match.params.project_id === 'undefined' && projects.editing.id !== '') {
            this.setState({
                button: { value: 'Agregar', disabled: true }
            });
            dispatch(clearProjectEditing());
        } else if (typeof this.props.match.params.project_id !== 'undefined' && projects.status === STATUS.COMPLETE &&
            Number(projects.editing.id) !== Number(this.props.match.params.project_id)) {
            const project = this.getEditingProject(this.props);

            if (project) {
                dispatch(editProject(project));
            }
        }
    }

    componentWillUnmount() {
        const editMode = typeof this.props.match.params.project_id !== 'undefined';

        if (editMode && this.props.projects.editing.id !== '') {
            this.props.dispatch(clearProjectEditing());
        }
    }

    render() {
        const canCreate = hasAccess('/proyectos', 'write');
        const { projects, match } = this.props;
        const notEditing = typeof match.params.project_id === 'undefined';
        const editing = !notEditing;

        return (
            <section className="project-wrapper">
                <Breadcrumbs { ...this.props } title={ this.props.projects.editing.name }/>
                <h3>Proyectos</h3>
                { notEditing && this.getProjects() }
                { (projects.projects.length < 10 && canCreate || editing) && this.getForm(this.props) }
            </section>
        );
    }

    getEditingProject({ projects, match }) {
        return projects.projects.find(a => Number(a.id) === Number(match.params.project_id));
    }

    getForm({ projects, match }) {
        const editMode = typeof match.params.project_id !== 'undefined';
        const title = editMode ? 'Editar' : 'Crear';

        if (editMode && projects.editing.id === '' || !editMode && projects.editing.id !== '') {
            return <Spinner/>;
        }

        return <div><hr/><h5>{`${title} Proyecto`}</h5><FormGenerator { ...{
            formName: 'project',
            button: this.state.button,
            elements: [
                {
                    type: 'text',
                    placeholder: 'Nombre Del Proyecto',
                    onChange: this.validateFields,
                    name: 'name',
                    defaultValue: projects.editing.name
                },
                {
                    type: 'tel',
                    placeholder: 'Telefono',
                    onChange: this.validateFields,
                    name: 'phone',
                    defaultValue: projects.editing.contact
                },
                {
                    type: 'text',
                    placeholder: 'Direccion',
                    onChange: this.validateFields,
                    name: 'address',
                    defaultValue: projects.editing.address
                },
                {
                    type: 'checkbox',
                    placeholder: 'Activar',
                    onChange: this.validateFields,
                    id: 'active',
                    name: 'active',
                    label: 'Activar',
                    checked: projects.editing.active
                },
            ],
            callback: this.handleSubmit,
            object: this
        } }/></div>;
    }

    getProjects() {
        const { projects } = this.props;

        const canEdit = hasAccess('/proyectos', 'write');

        if (projects.projects && projects.projects.length === 0) {
            return <div className="alert alert-warning">Aun no se ha creado ningun proyecto</div>;
        } else if (projects.projects.selected === null) {
            return <div className="alert alert-warning">No hay ningun proyecto activo, active uno de la lista</div>;
        }
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Direccion</th>
                        <th>Editar</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.projects.map((project, i) =>
                        <tr key={ i }>
                            <th scope='row'>{ i + 1 }</th>
                            <td>{ project.name }</td>
                            <td>{ project.contact }</td>
                            <td>{ project.address }</td>
                            <td>
                                { canEdit && <Link to={ `/proyectos/${project.id}` }><i className='fa fa-edit'/></Link> ||
                                <i className='fas fa-ban'/> }
                            </td>
                            <td>{ this.getCheckbox(project, canEdit) }</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    getCheckbox(item, canEdit) {
        if (canEdit) {
            const label = item.active ? 'Desactivar' : 'Activar';

            return <Checkbox
                name={ item.name }
                id={ item.id }
                label={ label }
                checked={ item.active }
                onChange={ this.selectCheckBox }
            />;
        }
        return <div><span>{ item.active && 'Activado' || 'Desactivado' }</span></div>;
    }

    selectCheckBox(checkbox) {
        const label = !checkbox.checked ? 'desactivar' : 'activar';

        const button = <button
            type='button' onClick={ () => {
                this.updateProjectStatus(checkbox);
            } } className='btn btn-warning'>OK</button>;

        this.props.dispatch(
            showOverlay(
                <div className='panel'>{`Estas seguro que quieres ${label} ${checkbox.name}`}?</div>,
                <div className='warning-prompt'><i className='fas fa-exclamation-triangle'/>Advertencia...</div>,
                true,
                button
            )
        );
    }

    updateProjectStatus(checkbox) {
        this.props.dispatch(updateProject({
            id: checkbox.id,
            active: checkbox.checked
        }, () => {
            this.props.dispatch(hideOverlay());
            this.props.dispatch(fetchProjects());
        }));
    }

    validateFields() {
        const project = {
            name: '',
            phone: '',
            active: false,
            address: ''
        };

        Object.keys(project).forEach((el) => {
            if (this.refs[el].type === 'checkbox') {
                project[el] = this.refs[el].checked;
            } else {
                project[el] = this.refs[el].value;
            }
        });

        if (project.name !== '' && project.phone !== '') {
            this.setState({
                button: { value: 'Agregar', disabled: false },
                project
            });
        } else {
            this.setState({
                button: { value: 'Agregar', disabled: true }
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        let action;
        let data;
        const editMode = typeof this.props.match.params.project_id !== 'undefined';

        if (editMode) {
            data = { ...this.state.project, id: this.props.match.params.project_id };
            action = updateProject;
        } else {
            action = createProject;
            data = { ...this.state.project };
        }

        this.props.dispatch(action(data, () => {
            if (editMode) {
                this.props.history.push('/proyectos');
            }
            this.props.dispatch(fetchProjects());
            this.setState({
                button: { value: 'Agregar', disabled: true },
                project: {}
            });

            Object.keys(this.refs).forEach((el) => {
                if (this.refs[el].type === 'checkbox') {
                    this.refs[el].checked = false;
                } else {
                    this.refs[el].value = '';
                }
            });
        }));
    }

    static propTypes = {
        projects: PropTypes.object,
        dispatch: PropTypes.func,
        match: PropTypes.object,
        params: PropTypes.object,
        history: PropTypes.object,
    };
}
