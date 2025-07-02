import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { pagoService } from '../../services/Basicos/pagoService';
import { reservaService } from '../../services/Basicos/reservaService';

const PagosCRUD = () => {
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPago, setCurrentPago] = useState({ 
    id_reserva: '', 
    monto: 0, 
    metodo_pago: 'efectivo', 
    estado: 'pendiente', 
    transaccion_id: '' 
  });
  const [filtroEstado, setFiltroEstado] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pagosData, reservasData] = await Promise.all([
          pagoService.obtenerTodos(),
          reservaService.obtenerTodos()
        ]);
        
        setPagos(pagosData);
        setReservas(reservasData);
        setError(null);
        
        // Valor por defecto para el formulario
        if (reservasData.length > 0 && !currentPago.id_reserva) {
          setCurrentPago(prev => ({...prev, id_reserva: reservasData[0].id_reserva}));
        }
      } catch (err) {
        setError('Error al cargar datos: ' + err.message);
      }
    };
    loadData();
  }, [refreshKey, currentPago]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPago.id_pago) {
        await pagoService.actualizar(currentPago.id_pago, currentPago);
      } else {
        await pagoService.crear(currentPago);
      }
      setShowModal(false);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Error al guardar pago: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este pago?')) {
      try {
        await pagoService.eliminar(id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        setError('Error al eliminar pago: ' + err.message);
      }
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await pagoService.actualizarEstado(id, { estado: nuevoEstado });
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError('Error al actualizar estado: ' + err.message);
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      pendiente: 'warning',
      completado: 'success',
      rechazado: 'danger',
      reembolsado: 'info'
    };
    return <Badge bg={variants[estado]}>{estado}</Badge>;
  };

  const filteredPagos = filtroEstado 
    ? pagos.filter(pago => pago.estado === filtroEstado)
    : pagos;

  const getReservaInfo = (id_reserva) => {
    const reserva = reservas.find(r => r.id_reserva === id_reserva);
    return reserva 
      ? `Reserva #${reserva.id_reserva} (${new Date(reserva.fecha_reserva).toLocaleDateString()})` 
      : 'Reserva desconocida';
  };

  return (
    <div>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <h4>Registro de Pagos</h4>
        <div>
          <Form.Select
            className="d-inline-block w-auto me-2"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="rechazado">Rechazados</option>
            <option value="reembolsado">Reembolsados</option>
          </Form.Select>
          <Button variant="primary" onClick={() => {
            setCurrentPago({ 
              id_reserva: reservas[0]?.id_reserva || '', 
              monto: 0, 
              metodo_pago: 'efectivo', 
              estado: 'pendiente', 
              transaccion_id: '' 
            });
            setShowModal(true);
          }}>
            <i className="fas fa-money-bill-wave me-1"></i> Registrar Pago
          </Button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Reserva</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPagos.map((pago) => (
            <tr key={pago.id_pago}>
              <td>{pago.id_pago}</td>
              <td>{getReservaInfo(pago.id_reserva)}</td>
              <td>${pago.monto.toFixed(2)}</td>
              <td>{pago.metodo_pago}</td>
              <td>{getEstadoBadge(pago.estado)}</td>
              <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString() : 'Pendiente'}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" 
                  onClick={() => {
                    setCurrentPago(pago);
                    setShowModal(true);
                  }}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="danger" size="sm" className="me-2"
                  onClick={() => handleDelete(pago.id_pago)}>
                  <i className="fas fa-trash"></i>
                </Button>
                {pago.estado === 'pendiente' && (
                  <Button variant="success" size="sm"
                    onClick={() => handleEstadoChange(pago.id_pago, 'completado')}>
                    <i className="fas fa-check"></i>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentPago.id_pago ? 'Editar' : 'Registrar'} Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Reserva *</Form.Label>
                  <Form.Select
                    value={currentPago.id_reserva}
                    onChange={(e) => setCurrentPago({...currentPago, id_reserva: parseInt(e.target.value)})}
                    required
                  >
                    {reservas.map(reserva => (
                      <option key={reserva.id_reserva} value={reserva.id_reserva}>
                        Reserva #{reserva.id_reserva} ({new Date(reserva.fecha_reserva).toLocaleDateString()})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago *</Form.Label>
                  <Form.Select
                    value={currentPago.metodo_pago}
                    onChange={(e) => setCurrentPago({...currentPago, metodo_pago: e.target.value})}
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>
              </div>
              
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Monto *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentPago.monto}
                    onChange={(e) => setCurrentPago({...currentPago, monto: parseFloat(e.target.value)})}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Estado *</Form.Label>
                  <Form.Select
                    value={currentPago.estado}
                    onChange={(e) => setCurrentPago({...currentPago, estado: e.target.value})}
                    required
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="reembolsado">Reembolsado</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>ID de Transacción</Form.Label>
              <Form.Control
                type="text"
                value={currentPago.transaccion_id}
                onChange={(e) => setCurrentPago({...currentPago, transaccion_id: e.target.value})}
                placeholder="Opcional para pagos digitales"
              />
            </Form.Group>
            
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

export default PagosCRUD;