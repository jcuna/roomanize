/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../utils/Checkbox';
import FormGenerator from '../../utils/FromGenerator';
import { createProject, fetchProjects, updateProject } from '../../actions/projectActions';
import Link from 'react-router-dom/es/Link';
import { hasAccess } from '../../utils/config';
import { hideOverlay, showOverlay } from '../../actions/appActions';

export default class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar', disabled: true },
            project: {
                name: '',
                contact: '',
                address: '',
                active: false,
            },
        };

        this.selectCheckBox = this.selectCheckBox.bind(this);
        this.validateFields = this.validateFields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const canCreate = hasAccess('/proyectos', 'write');

        return (
            <section className="project-wrapper">
                <h3>Proyectos</h3>
                {this.getProjects()}
                {this.props.projects.projects.length < 10 && canCreate && this.getForm()}
            </section>
        );
    }

    getForm() {
        const { project } = this.state;
        return <div><hr/><h5>Crear Proyecto nuevo</h5><FormGenerator { ...{
            formName: 'project',
            button: this.state.button,
            elements: [
                { type: 'text', placeholder: 'Nombre Del Proyecto', onChange: this.validateFields, name: 'name', defaultValue: project.name },
                { type: 'tel', placeholder: 'Telefono', onChange: this.validateFields, name: 'phone', defaultValue: project.contact },
                { type: 'text', placeholder: 'Direccion', onChange: this.validateFields, name: 'address', defaultValue: project.address },
                { type: 'checkbox', placeholder: 'Activar', onChange: this.validateFields, id: 'active', name: 'active', label: 'Activar' },
            ],
            callback: this.handleSubmit,
            object: this
        } }/></div>;
    }

    getProjects() {
        const { projects } = this.props;

        const canEdit = hasAccess('/proyectos', 'write');

        if (projects.projects.length === 0) {
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
                            <th scope='row'>{ i }</th>
                            <td>{ project.name }</td>
                            <td>{ project.contact }</td>
                            <td>{ project.address }</td>
                            <td>
                                { canEdit && <span onClick={ (project) => {
                                    this.props.dispatch(showOverlay());
                                }
                                }><i className='fa fa-edit'/></span> ||
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
        this.props.dispatch(createProject(this.state.project, () => {
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
    };
}
