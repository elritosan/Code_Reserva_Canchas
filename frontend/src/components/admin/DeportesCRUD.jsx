// frontend/src/components/admin/DeportesCRUD.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { deporteService } from '../../services/Basicos/deporteService';

const DeportesCRUD = () => {
  const [deportes, setDeportes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDeporte, setCurrentDeporte] = useState({ nombre: '', descripcion: '', imagen_url: '' });

  useEffect(() => {
    loadDeportes();
  }, []);

  const loadDeportes = async () => {
    try {
      const data = await deporteService.obtenerTodos();
      setDeportes(data);
    } catch (error) {
      console.error('Error al cargar deportes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentDeporte.id_deporte) {
        await deporteService.actualizar(currentDeporte.id_deporte, currentDeporte);
      } else {
        await deporteService.crear(currentDeporte);
      }
      setShowModal(false);
      loadDeportes();
    } catch (error) {
      console.error('Error al guardar deporte:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este deporte?')) {
      try {
        await deporteService.eliminar(id);
        loadDeportes();
      } catch (error) {
        console.error('Error al eliminar deporte:', error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Listado de Deportes</h4>
        <Button variant="primary" onClick={() => {
          setCurrentDeporte({ nombre: '', descripcion: '', imagen_url: '' });
          setShowModal(true);
        }}>
          <i className="fas fa-plus me-1"></i> Agregar Deporte
        </Button>
      </div>

      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {deportes.map((deporte) => (
            <tr key={deporte.id_deporte}>
              <td>{deporte.id_deporte}</td>
              <td>{deporte.nombre}</td>
              <td>{deporte.descripcion}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => {
                  setCurrentDeporte(deporte);
                  setShowModal(true);
                }}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(deporte.id_deporte)}>
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentDeporte.id_deporte ? 'Editar' : 'Agregar'} Deporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentDeporte.nombre}
                onChange={(e) => setCurrentDeporte({...currentDeporte, nombre: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentDeporte.descripcion}
                onChange={(e) => setCurrentDeporte({...currentDeporte, descripcion: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL de Imagen</Form.Label>
              <Form.Control
                type="text"
                value={currentDeporte.imagen_url}
                onChange={(e) => setCurrentDeporte({...currentDeporte, imagen_url: e.target.value})}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DeportesCRUD;