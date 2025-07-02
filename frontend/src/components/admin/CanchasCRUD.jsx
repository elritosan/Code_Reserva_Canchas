// frontend/src/components/admin/CanchasCRUD.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { canchaService } from '../../services/Basicos/canchaService';
import { deporteService } from '../../services/Basicos/deporteService';

const CanchasCRUD = () => {
  const [canchas, setCanchas] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCancha, setCurrentCancha] = useState({ 
    nombre: '', 
    id_deporte: '', 
    descripcion: '', 
    precio_hora: 0, 
    imagen_url: '', 
    activa: true 
  });

  useEffect(() => {
    loadCanchas();
    loadDeportes();
  }, []);

  const loadCanchas = async () => {
    try {
      const data = await canchaService.obtenerTodas();
      setCanchas(data);
    } catch (error) {
      console.error('Error al cargar canchas:', error);
    }
  };

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
      if (currentCancha.id_cancha) {
        await canchaService.actualizar(currentCancha.id_cancha, currentCancha);
      } else {
        await canchaService.crear(currentCancha);
      }
      setShowModal(false);
      loadCanchas();
    } catch (error) {
      console.error('Error al guardar cancha:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta cancha?')) {
      try {
        await canchaService.eliminar(id);
        loadCanchas();
      } catch (error) {
        console.error('Error al eliminar cancha:', error);
      }
    }
  };

  const getDeporteNombre = (id) => {
    const deporte = deportes.find(d => d.id_deporte === id);
    return deporte ? deporte.nombre : 'Desconocido';
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Listado de Canchas</h4>
        <Button variant="primary" onClick={() => {
          setCurrentCancha({ 
            nombre: '', 
            id_deporte: deportes[0]?.id_deporte || '', 
            descripcion: '', 
            precio_hora: 0, 
            imagen_url: '', 
            activa: true 
          });
          setShowModal(true);
        }}>
          <i className="fas fa-plus me-1"></i> Agregar Cancha
        </Button>
      </div>

      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Deporte</th>
            <th>Precio/Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {canchas.map((cancha) => (
            <tr key={cancha.id_cancha}>
              <td>{cancha.id_cancha}</td>
              <td>{cancha.nombre}</td>
              <td>{getDeporteNombre(cancha.id_deporte)}</td>
              <td>${cancha.precio_hora}</td>
              <td>{cancha.activa ? 'Activa' : 'Inactiva'}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => {
                  setCurrentCancha(cancha);
                  setShowModal(true);
                }}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(cancha.id_cancha)}>
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentCancha.id_cancha ? 'Editar' : 'Agregar'} Cancha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentCancha.nombre}
                onChange={(e) => setCurrentCancha({...currentCancha, nombre: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deporte</Form.Label>
              <Form.Select
                value={currentCancha.id_deporte}
                onChange={(e) => setCurrentCancha({...currentCancha, id_deporte: parseInt(e.target.value)})}
                required
              >
                {deportes.map(deporte => (
                  <option key={deporte.id_deporte} value={deporte.id_deporte}>
                    {deporte.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio por Hora</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={currentCancha.precio_hora}
                onChange={(e) => setCurrentCancha({...currentCancha, precio_hora: parseFloat(e.target.value)})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentCancha.descripcion}
                onChange={(e) => setCurrentCancha({...currentCancha, descripcion: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL de Imagen</Form.Label>
              <Form.Control
                type="text"
                value={currentCancha.imagen_url}
                onChange={(e) => setCurrentCancha({...currentCancha, imagen_url: e.target.value})}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              label="Activa"
              checked={currentCancha.activa}
              onChange={(e) => setCurrentCancha({...currentCancha, activa: e.target.checked})}
            />
            <Button variant="primary" type="submit" className="mt-3">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CanchasCRUD;