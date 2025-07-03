-- 1. Eliminar tablas existentes (en orden de dependencia)
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS horarios_disponibles CASCADE;
DROP TABLE IF EXISTS canchas CASCADE;
DROP TABLE IF EXISTS deportes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;

-- 2. Crear tablas
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    id_rol INT REFERENCES roles(id_rol) ON DELETE CASCADE DEFAULT 2, -- 2 = cliente por defecto
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verificado BOOLEAN DEFAULT FALSE
);

CREATE TABLE deportes (
    id_deporte SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(255)
);

CREATE TABLE canchas (
    id_cancha SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    id_deporte INT REFERENCES deportes(id_deporte) ON DELETE CASCADE,
    descripcion TEXT,
    precio_hora DECIMAL(8,2) NOT NULL,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE horarios_disponibles (
    id_horario SERIAL PRIMARY KEY,
    id_cancha INT REFERENCES canchas(id_cancha) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    UNIQUE (id_cancha, dia_semana, hora_inicio)
);

CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_horario INT REFERENCES horarios_disponibles(id_horario) ON DELETE CASCADE,
    fecha_reserva DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_horario, fecha_reserva)
);

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INT REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    monto DECIMAL(8,2) NOT NULL,
    metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('tarjeta', 'transferencia', 'efectivo')),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'rechazado', 'reembolsado')),
    fecha_pago TIMESTAMP,
    transaccion_id VARCHAR(100)
);

-- 3. Insertar datos básicos
INSERT INTO roles (nombre, descripcion) VALUES 
('admin', 'Administrador del sistema'),
('cliente', 'Usuario que realiza reservas'),
('empleado', 'Personal del centro deportivo');

INSERT INTO deportes (nombre, descripcion) VALUES 
('Fútbol', 'Cancha de fútbol 11 o fútbol 7'),
('Tenis', 'Cancha de tenis individual o dobles'),
('Básquet', 'Cancha de baloncesto estándar');

-- 4. Crear índices para mejorar rendimiento
CREATE INDEX idx_reservas_usuario ON reservas(id_usuario);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX idx_horarios_cancha ON horarios_disponibles(id_cancha);