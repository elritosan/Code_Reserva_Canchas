// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usuarioService } from '../services/Basicos/usuarioService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const currentPath = window.location.pathname;
    
    if (!storedUser && currentPath !== '/signup') {
      navigate('/login');
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <div>Cargando...</div>; // Pantalla de carga inicial
  }
  
  // Validaciones básicas
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Registrar nuevo usuario
  const signUp = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones
      if (!userData.nombre || !userData.email || !userData.password || !userData.telefono) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (!validateEmail(userData.email)) {
        throw new Error('El email no es válido');
      }

      if (!validatePassword(userData.password)) {
        throw new Error(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial (@$!%*?&)'
        );
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Validar formato de teléfono (opcional)
      if (!/^[0-9]{10,15}$/.test(userData.telefono)) {
        throw new Error('El teléfono debe tener entre 10 y 15 dígitos');
      }

      await usuarioService.crear({
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        telefono: userData.telefono,
        id_rol: 1 // Rol de Administrador por defecto
      });

      // Autologin después del registro
      const loggedUser = await usuarioService.login(userData.email, userData.password);
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      navigate('/');
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error en el registro');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      const loggedUser = await usuarioService.login(credentials.email, credentials.password);
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      navigate('/'); // Redirigir al home después del login
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Error en el inicio de sesión');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Verificar sesión al cargar la app
  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        error,
        signUp,
        login,
        logout,
        checkAuth,
        isAuthenticated: !!user,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);