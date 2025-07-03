// frontend/src/views/auth/SignUp.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Alert, Card } from 'react-bootstrap';

const SignUp = () => {
  const { signUp, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUp(formData);
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }} className="p-4 shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Registro</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Form.Text>Mínimo 8 caracteres</Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SignUp;