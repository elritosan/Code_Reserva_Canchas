import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { reservaService } from '../../services/Basicos/reservaService';
import { horarioDisponibleService } from '../../services/Basicos/horarioDisponibleService';
import { usuarioService } from '../../services/Basicos/usuarioService';

const ReservasCRUD = ({ refreshKey, setRefreshKey }) => {
  const [reservas, setReservas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentReserva, setCurrentReserva] = useState({ 
    id_usuario: '', 
    id_horario: '', 
    fecha_reserva: '', 
    estado: 'pendiente' 
  });
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reservasData, horariosData, usuariosData] = await Promise.all([
          reservaService.obtenerTodos(),
          horarioDisponibleService.obtenerTodos(),
          usuarioService.obtenerTodos()
        ]);
        
        setReservas(reservasData);
        setHorarios(horariosData);
        setUsuarios(usuariosData);
        setError(null);
        
        // Valores por defecto para el formulario
        if (usuariosData.length > 0 && !currentReserva.id_usuario) {
          setCurrentReserva(prev => ({...prev, id_usuario: usuariosData[0].id_usuario}));
        }
        if (horariosData.length > 0 && !currentReserva.id_horario) {
          setCurrentReserva(prev => ({...prev, id_horario: horariosData[0].id_horario}));
        }
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      }
    };
    loadData();
  }, [refreshKey, currentReserva]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentReserva.id_reserva) {
        await reservaService.actualizar(currentReserva.id_reserva, currentReserva);
      } else {
        await reservaService.crear(currentReserva);
      }
      setShowModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Error al guardar reserva: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta reserva?')) {
      try {
        await reservaService.eliminar(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        setError('Error al eliminar reserva: ' + err.message);
      }
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await reservaService.actualizarEstado(id, nuevoEstado);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Error al actualizar estado: ' + err.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      pendiente: 'warning',
      confirmada: 'success',
      cancelada: 'danger',
      completada: 'primary'
    };
    return <Badge bg={variants[estado]}>{estado}</Badge>;
  };

  const filteredReservas = reservas.filter(reserva => {
    const cumpleFecha = filtroFecha ? reserva.fecha_reserva === filtroFecha : true;
    const cumpleEstado = filtroEstado ? reserva.estado === filtroEstado : true;
    return cumpleFecha && cumpleEstado;
  });

  return (
    <div>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <h4>Listado de Reservas</h4>
        <div>
          <Form.Control
            type="date"
            className="d-inline-block w-auto me-2"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
          <Form.Select
            className="d-inline-block w-auto me-2"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="completada">Completadas</option>
          </Form.Select>
          <Button variant="primary" onClick={() => {
            setCurrentReserva({ 
              id_usuario: usuarios[0]?.id_usuario || '', 
              id_horario: horarios[0]?.id_horario || '', 
              fecha_reserva: new Date().toISOString().split('T')[0], 
              estado: 'pendiente' 
            });
            setShowModal(true);
          }}>
            <i className="fas fa-plus me-1"></i> Nueva Reserva
          </Button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Cancha</th>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredReservas.map((reserva) => {
            const usuario = usuarios.find(u => u.id_usuario === reserva.id_usuario);
            const horario = horarios.find(h => h.id_horario === reserva.id_horario);
            const cancha = horario ? horarios.find(h => h.id_horario === reserva.id_horario) : null;
            
            return (
              <tr key={reserva.id_reserva}>
                <td>{reserva.id_reserva}</td>
                <td>{usuario?.nombre || 'Desconocido'}</td>
                <td>{cancha?.nombre_cancha || 'Desconocido'}</td>
                <td>{new Date(reserva.fecha_reserva).toLocaleDateString()}</td>
                <td>
                  {horario ? `${horario.hora_inicio} - ${horario.hora_fin}` : 'N/A'}
                </td>
                <td>{getEstadoBadge(reserva.estado)}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" 
                    onClick={() => {
                      setCurrentReserva(reserva);
                      setShowModal(true);
                    }}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="danger" size="sm" className="me-2"
                    onClick={() => handleDelete(reserva.id_reserva)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                  {reserva.estado === 'pendiente' && (
                    <Button variant="success" size="sm"
                      onClick={() => handleEstadoChange(reserva.id_reserva, 'confirmada')}>
                      <i className="fas fa-check"></i>
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentReserva.id_reserva ? 'Editar' : 'Nueva'} Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Usuario *</Form.Label>
                  <Form.Select
                    value={currentReserva.id_usuario}
                    onChange={(e) => setCurrentReserva({...currentReserva, id_usuario: parseInt(e.target.value)})}
                    required
                  >
                    {usuarios.map(usuario => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre} ({usuario.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Fecha *</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentReserva.fecha_reserva}
                    onChange={(e) => setCurrentReserva({...currentReserva, fecha_reserva: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Horario *</Form.Label>
                  <Form.Select
                    value={currentReserva.id_horario}
                    onChange={(e) => setCurrentReserva({...currentReserva, id_horario: parseInt(e.target.value)})}
                    required
                  >
                    {horarios.map(horario => {
                      const cancha = horarios.find(h => h.id_horario === horario.id_horario);
                      return (
                        <option key={horario.id_horario} value={horario.id_horario}>
                          {cancha?.nombre_cancha || 'Cancha'} - {horario.hora_inicio} a {horario.hora_fin}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Estado *</Form.Label>
                  <Form.Select
                    value={currentReserva.estado}
                    onChange={(e) => setCurrentReserva({...currentReserva, estado: e.target.value})}
                    required
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="completada">Completada</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            
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

export default ReservasCRUD;