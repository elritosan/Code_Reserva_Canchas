// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="sidebar-header mb-4">
        <h4>Panel de Administración</h4>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/admin" className="nav-link text-white">
            <i className="fas fa-tachometer-alt me-2"></i> Dashboard
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/admin/gestion-canchas" className="nav-link text-white">
            <i className="fas fa-futbol me-2"></i> Gestión de Canchas
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/admin/gestion-reservas" className="nav-link text-white">
            <i className="fas fa-calendar-check me-2"></i> Gestión de Reservas
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;