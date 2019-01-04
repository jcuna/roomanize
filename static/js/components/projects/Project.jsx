/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../utils/Checkbox';
import FormGenerator from '../../utils/FromGenerator';
import { createProject, fetchProjects } from '../../actions/projectActions';
import Link from 'react-router-dom/es/Link';
import { hasAccess } from '../../utils/config';

export default class Project extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar', disabled: true },
            newProject: {}
        };

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
        return <div><hr/><h5>Crear Proyecto nuevo</h5><FormGenerator { ...{
            formName: 'new-project',
            button: this.state.button,
            elements: [
                { type: 'text', placeholder: 'Nombre Del Proyecto', onChange: this.validateFields, name: 'name' },
                { type: 'tel', placeholder: 'Telefono', onChange: this.validateFields, name: 'phone' },
                { type: 'text', placeholder: 'Direccion', onChange: this.validateFields, name: 'address' },
                { type: 'checkbox', placeholder: 'Activar', onChange: this.validateFields, id: 'status', name: 'status', label: 'Activar' },
            ],
            callback: this.handleSubmit,
            object: this
            // initialRefs: this.initialRefs
        } }/></div>;
    }

    getProjects() {
        const { projects } = this.props;

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
                            <td><Link to={ `proyectos/${project.id}` }><i className='fa fa-edit'/></Link></td>
                            <td>{ this.getCheckbox(project) }</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    getCheckbox(item) {
        const label = item.active ? 'Desactivar' : 'Activar';

        return <Checkbox
            name={ 'toggle-active' }
            id={ item.id }
            label={ label }
            checked={ item.active }
            onChange={ this.selectCheckBox }
        />;
    }

    selectCheckBox() {

    }

    validateFields() {
        const project = {
            name: '',
            phone: '',
            status: false,
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
                newProject: project
            });
        } else {
            this.setState({
                button: { value: 'Agregar', disabled: true }
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.dispatch(createProject(this.state.newProject, () => {
            this.props.dispatch(fetchProjects());
            this.setState({
                button: { value: 'Agregar', disabled: true },
                newProject: {}
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
