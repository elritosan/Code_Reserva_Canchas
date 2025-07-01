// frontend/src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { usuarioService } from '../services/Basicos/usuarioService';
import { rolService } from '../services/Basicos/rolService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('reservaUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setCurrentRole(parsedUser.id_rol === 1 ? 'admin' : 'cliente');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const usuario = await usuarioService.login(email, password);
      const rol = await rolService.obtenerPorId(usuario.id_rol);
      
      const userData = {
        ...usuario,
        rolNombre: rol.nombre
      };

      localStorage.setItem('reservaUser', JSON.stringify(userData));
      setUser(userData);
      setCurrentRole(rol.nombre === 'admin' ? 'admin' : 'cliente');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Asignar rol de cliente por defecto (id_rol = 2)
      const newUser = await usuarioService.crear({ 
        ...userData, 
        id_rol: 1
      });
      localStorage.setItem('reservaUser', JSON.stringify(newUser));
      setUser(newUser);
      setCurrentRole('cliente');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('reservaUser');
    setUser(null);
    setCurrentRole(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      currentRole,
      loading,
      login,
      register,
      logout,
      isAdmin: currentRole === 'admin'
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);