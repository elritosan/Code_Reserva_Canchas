// frontend/src/views/admin/AdminDashboard.jsx
import React from 'react';
import DashboardCard from '../../components/common/DashboardCard';

const AdminDashboard = () => {
  const cards = [
    {
      icon: 'fas fa-futbol',
      title: 'Gestión de Canchas',
      description: 'Administra deportes, canchas y horarios disponibles.',
      actionText: 'Ir a Canchas',
      path: '/admin/gestion-canchas'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Gestión de Reservas',
      description: 'Administra reservas y pagos de los clientes.',
      actionText: 'Ir a Reservas',
      path: '/admin/gestion-reservas'
    }
  ];

  return (
    <div className="container dashboard-section py-4">
      <h2 className="mb-4">Panel de Control</h2>
      <div className="row g-4">
        {cards.map((card, index) => (
          <div key={index} className="col-12 col-md-6">
            <DashboardCard {...card} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;