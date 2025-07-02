// frontend\src\components\admin\HorariosCRUD.jsx
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Alert } from 'react-bootstrap';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [horariosData, canchasData] = await Promise.all([
          horarioDisponibleService.obtenerTodos(),
          canchaService.obtenerTodas()
        ]);
        
        setHorarios(horariosData);
        setCanchas(canchasData);
        setError(null);
        
        // Establecer la primera cancha como valor por defecto si no hay una seleccionada
        if (canchasData.length > 0 && !currentHorario.id_cancha) {
          setCurrentHorario(prev => ({...prev, id_cancha: canchasData[0].id_cancha}));
        }
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      }
    };
    loadData();
  }, [refreshKey, currentHorario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentHorario.id_horario) {
        await horarioDisponibleService.actualizar(currentHorario.id_horario, currentHorario);
      } else {
        await horarioDisponibleService.crear(currentHorario);
      }
      setShowModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Error al guardar horario: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este horario?')) {
      try {
        await horarioDisponibleService.eliminar(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        setError('Error al eliminar horario: ' + err.message);
      }
    }
  };

  const diasSemana = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 7, nombre: 'Domingo' }
  ];

  const filteredHorarios = filtroCancha 
    ? horarios.filter(h => h.id_cancha === parseInt(filtroCancha))
    : horarios;

  return (
    <div>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
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

      <Table striped bordered hover responsive>
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
          {filteredHorarios.map((horario) => {
            const cancha = canchas.find(c => c.id_cancha === horario.id_cancha);
            const dia = diasSemana.find(d => d.id === horario.dia_semana);
            
            return (
              <tr key={horario.id_horario}>
                <td>{horario.id_horario}</td>
                <td>{cancha?.nombre || 'Desconocido'}</td>
                <td>{dia?.nombre || 'Desconocido'}</td>
                <td>{horario.hora_inicio}</td>
                <td>{horario.hora_fin}</td>
                <td>
                  <span className={`badge ${horario.disponible ? 'bg-success' : 'bg-secondary'}`}>
                    {horario.disponible ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" 
                    onClick={() => {
                      setCurrentHorario(horario);
                      setShowModal(true);
                    }}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="danger" size="sm" 
                    onClick={() => handleDelete(horario.id_horario)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentHorario.id_horario ? 'Editar' : 'Agregar'} Horario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cancha *</Form.Label>
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
              <Form.Label>Día de la Semana *</Form.Label>
              <Form.Select
                value={currentHorario.dia_semana}
                onChange={(e) => setCurrentHorario({...currentHorario, dia_semana: parseInt(e.target.value)})}
                required
              >
                {diasSemana.map(dia => (
                  <option key={dia.id} value={dia.id}>
                    {dia.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Hora Inicio *</Form.Label>
                  <Form.Control
                    type="time"
                    value={currentHorario.hora_inicio}
                    onChange={(e) => setCurrentHorario({...currentHorario, hora_inicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Hora Fin *</Form.Label>
                  <Form.Control
                    type="time"
                    value={currentHorario.hora_fin}
                    onChange={(e) => setCurrentHorario({...currentHorario, hora_fin: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            
            <Form.Check
              type="switch"
              id="disponible-switch"
              label="Horario disponible"
              checked={currentHorario.disponible}
              onChange={(e) => setCurrentHorario({...currentHorario, disponible: e.target.checked})}
              className="mb-3"
            />
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HorariosCRUD;