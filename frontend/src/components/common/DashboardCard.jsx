// frontend\src\components\common\DashboardCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ icon, title, description, actionText, path }) => {
  const navigate = useNavigate();
  
  return (
    <div className="card text-center shadow-sm h-100 hover-effect">
      <div className="card-body">
        <div className="card-icon mb-2">
          <i className={`bi ${icon}`}></i>
        </div>
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{description}</p>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate(path)}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;