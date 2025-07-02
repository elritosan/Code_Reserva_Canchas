// frontend/src/components/admin/HorariosCRUD.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { horarioDisponibleService } from '../../services/Basicos/horarioDisponibleService';
import { canchaService } from '../../services/Basicos/canchaService';

const HorariosCRUD = () => {
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentHorario, setCurrentHorario] = useState({ 
    id_cancha: '', 
    dia_semana: 1, 
    hora_inicio: '', 
    hora_fin: '', 
    disponible: true 
  });
  const [filtroCancha, setFiltroCancha] = useState('');

  useEffect(() => {
    loadHorarios();
    loadCanchas();
  }, []);

  const loadHorarios = async () => {
    try {
      const data = await horarioDisponibleService.obtenerTodos();
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const loadCanchas = async () => {
    try {
      const data = await canchaService.obtenerTodas();
      setCanchas(data);
    } catch (error) {
      console.error('Error al cargar canchas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentHorario.id_horario) {
        await horarioDisponibleService.actualizar(currentHorario.id_horario, currentHorario);
      } else {
        await horarioDisponibleService.crear(currentHorario);
      }
      setShowModal(false);
      loadHorarios();
    } catch (error) {
      console.error('Error al guardar horario:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este horario?')) {
      try {
        await horarioDisponibleService.eliminar(id);
        loadHorarios();
      } catch (error) {
        console.error('Error al eliminar horario:', error);
      }
    }
  };

  const getCanchaNombre = (id) => {
    const cancha = canchas.find(c => c.id_cancha === id);
    return cancha ? cancha.nombre : 'Desconocido';
  };

  const getDiaSemana = (dia) => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[dia - 1] || 'Desconocido';
  };

  const filteredHorarios = filtroCancha 
    ? horarios.filter(h => h.id_cancha === parseInt(filtroCancha))
    : horarios;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Horarios Disponibles</h4>
        <div>
          <Form.Select 
            className="d-inline-block w-auto me-2" 
            value={filtroCancha}
            onChange={(e) => setFiltroCancha(e.target.value)}
          >
            <option value="">Todas las canchas</option>
            {canchas.map(cancha => (
              <option key={cancha.id_cancha} value={cancha.id_cancha}>
                {cancha.nombre}
              </option>
            ))}
          </Form.Select>
          <Button variant="primary" onClick={() => {
            setCurrentHorario({ 
              id_cancha: canchas[0]?.id_cancha || '', 
              dia_semana: 1, 
              hora_inicio: '', 
              hora_fin: '', 
              disponible: true 
            });
            setShowModal(true);
          }}>
            <i className="fas fa-plus me-1"></i> Agregar Horario
          </Button>
        </div>
      </div>

      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Cancha</th>
            <th>Día</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredHorarios.map((horario) => (
            <tr key={horario.id_horario}>
              <td>{horario.id_horario}</td>
              <td>{getCanchaNombre(horario.id_cancha)}</td>
              <td>{getDiaSemana(horario.dia_semana)}</td>
              <td>{horario.hora_inicio}</td>
              <td>{horario.hora_fin}</td>
              <td>{horario.disponible ? 'Sí' : 'No'}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => {
                  setCurrentHorario(horario);
                  setShowModal(true);
                }}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(horario.id_horario)}>
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentHorario.id_horario ? 'Editar' : 'Agregar'} Horario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cancha</Form.Label>
              <Form.Select
                value={currentHorario.id_cancha}
                onChange={(e) => setCurrentHorario({...currentHorario, id_cancha: parseInt(e.target.value)})}
                required
              >
                {canchas.map(cancha => (
                  <option key={cancha.id_cancha} value={cancha.id_cancha}>
                    {cancha.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Día de la Semana</Form.Label>
              <Form.Select
                value={currentHorario.dia_semana}
                onChange={(e) => setCurrentHorario({...currentHorario, dia_semana: parseInt(e.target.value)})}
                required
              >
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
                <option value={6}>Sábado</option>
                <option value={7}>Domingo</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora Inicio</Form.Label>
              <Form.Control
                type="time"
                value={currentHorario.hora_inicio}
                onChange={(e) => setCurrentHorario({...currentHorario, hora_inicio: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora Fin</Form.Label>
              <Form.Control
                type="time"
                value={currentHorario.hora_fin}
                onChange={(e) => setCurrentHorario({...currentHorario, hora_fin: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Check
              type="switch"
              label="Disponible"
              checked={currentHorario.disponible}
              onChange={(e) => setCurrentHorario({...currentHorario, disponible: e.target.checked})}
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

export default HorariosCRUD;