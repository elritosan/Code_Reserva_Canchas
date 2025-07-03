// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import Navbar from './components/common/Navbar';
import AdminLayout from "./views/admin/AdminLayout";
import AdminDashboard from "./views/admin/AdminDashboard";
import GestionarCanchas from "./views/admin/GestionarCanchas";
import GestionarReservas from "./views/admin/GestionarReservas";

import { AuthProvider } from './context/AuthContext';

import Login from './views/auth/Login';
import SignUp from './views/auth/SignUp'

function MainApp() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        {/* Ruta por defecto (redirige a /admin) */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Rutas de Administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gestion-canchas" element={<GestionarCanchas />} />
          <Route path="gestion-reservas" element={<GestionarReservas />} />
        </Route>
        
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function AppWrapper() {
  return (
      <Router>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </Router>
  );
}

export default AppWrapper;