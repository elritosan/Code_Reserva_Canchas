// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar bg-dark text-white p-3 d-flex flex-column" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="sidebar-header mb-4">
        <h4>Panel de Administración</h4>
      </div>
      
      <ul className="nav flex-column flex-grow-1">
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

      {/* Sección de usuario y cerrar sesión */}
      <div className="mt-auto pb-3">
        <div className="d-flex align-items-center mb-3">
          <i className="fas fa-user-circle fs-4 me-2"></i>
          <div>
            <div className="fw-bold">{user?.nombre}</div>
            <small className="text-muted">Administrador</small>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-outline-light w-100"
        >
          <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;