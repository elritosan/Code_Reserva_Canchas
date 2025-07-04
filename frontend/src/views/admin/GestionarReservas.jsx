import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import ReservasCRUD from '../../components/admin/ReservasCRUD';
import PagosCRUD from '../../components/admin/PagosCRUD';

const GestionarReservas = () => {
  const [key, setKey] = useState('reservas');
  const [refreshKey, setRefreshKey] = useState(0); // Estado compartido

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4"><i className="fas fa-calendar-check me-2"></i>Gestión de Reservas</h2>
      
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="reservas" title="Reservas">
          <ReservasCRUD refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        </Tab>
        <Tab eventKey="pagos" title="Pagos">
          <PagosCRUD refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default GestionarReservas;