import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import ReservasCRUD from '../../components/admin/ReservasCRUD';
import PagosCRUD from '../../components/admin/PagosCRUD';

const GestionarReservas = () => {
  const [key, setKey] = useState('reservas');

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4"><i className="fas fa-calendar-check me-2"></i>Gestión de Reservas</h2>
      
      <Tabs
        id="reservas-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="reservas" title="Reservas">
          <ReservasCRUD />
        </Tab>
        <Tab eventKey="pagos" title="Pagos">
          <PagosCRUD />
        </Tab>
      </Tabs>
    </div>
  );
};

export default GestionarReservas;