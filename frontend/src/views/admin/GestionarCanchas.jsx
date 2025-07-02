// frontend/src/views/admin/GestionarCanchas.jsx
import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import DeportesCRUD from '../../components/admin/DeportesCRUD';
import CanchasCRUD from '../../components/admin/CanchasCRUD';
import HorariosCRUD from '../../components/admin/HorariosCRUD';

const GestionarCanchas = () => {
  const [key, setKey] = useState('deportes');

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4"><i className="fas fa-futbol me-2"></i>Gestión de Canchas</h2>
      
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="deportes" title="Deportes">
          <DeportesCRUD />
        </Tab>
        <Tab eventKey="canchas" title="Canchas">
          <CanchasCRUD />
        </Tab>
        <Tab eventKey="horarios" title="Horarios">
          <HorariosCRUD />
        </Tab>
      </Tabs>
    </div>
  );
};

export default GestionarCanchas;