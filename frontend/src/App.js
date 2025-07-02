// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './components/common/Navbar';
import AdminLayout from "./views/admin/AdminLayout";
import AdminDashboard from "./views/admin/AdminDashboard";
import GestionarCanchas from "./views/admin/GestionarCanchas";
import GestionarReservas from "./views/admin/GestionarReservas";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Ruta por defecto (redirige a /admin) */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Rutas de Administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gestion-canchas" element={<GestionarCanchas />} />
          <Route path="gestion-reservas" element={<GestionarReservas />} />
        </Route>
        
        {/* Ruta para páginas no encontradas (redirige a /admin) */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;