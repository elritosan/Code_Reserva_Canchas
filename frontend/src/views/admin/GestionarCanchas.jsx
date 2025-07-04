// frontend/src/views/admin/GestionarCanchas.jsx
import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import DeportesCRUD from '../../components/admin/DeportesCRUD';
import CanchasCRUD from '../../components/admin/CanchasCRUD';
import HorariosCRUD from '../../components/admin/HorariosCRUD';

const GestionarCanchas = () => {
  const [key, setKey] = useState('deportes');
  const [refreshKey, setRefreshKey] = useState(0); // Estado compartido

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4"><i className="fas fa-futbol me-2"></i>Gestión de Canchas</h2>
      
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="deportes" title="Deportes">
          <DeportesCRUD refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        </Tab>
        <Tab eventKey="canchas" title="Canchas">
          <CanchasCRUD refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        </Tab>
        <Tab eventKey="horarios" title="Horarios">
          <HorariosCRUD refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default GestionarCanchas;