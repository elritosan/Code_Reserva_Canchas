// backend/controllers/Basicos/Class_pago_Controller.js
const ClassPago = require("../../models/Basicos/Class_pago");

exports.crearPago = async (req, res) => {
  try {
    const { id_reserva, monto, metodo_pago, transaccion_id } = req.body;
    const nuevoPago = await ClassPago.crear({ 
      id_reserva, 
      monto, 
      metodo_pago, 
      transaccion_id 
    });
    
    res.status(201).json({
      success: true,
      mensaje: "Pago registrado exitosamente",
      data: nuevoPago
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al registrar pago",
      detalles: error.message
    });
  }
};

exports.obtenerTodosPagos = async (req, res) => {
  try {
    const pagos = await ClassPago.obtenerTodos();
    res.json({
      success: true,
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener pagos",
      detalles: error.message
    });
  }
};

exports.obtenerPagosPorReserva = async (req, res) => {
  try {
    const pagos = await ClassPago.obtenerPorReserva(req.params.id_reserva);
    res.json({
      success: true,
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener pagos",
      detalles: error.message
    });
  }
};

exports.obtenerPagosPorUsuario = async (req, res) => {
  try {
    const pagos = await ClassPago.obtenerPorUsuario(req.params.id_usuario);
    res.json({
      success: true,
      count: pagos.length,
      data: pagos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener pagos del usuario",
      detalles: error.message
    });
  }
};

exports.obtenerPago = async (req, res) => {
  try {
    const pago = await ClassPago.obtenerPorId(req.params.id_pago);
    if (!pago) {
      return res.status(404).json({
        success: false,
        error: "Pago no encontrado"
      });
    }
    res.json({ success: true, data: pago });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al obtener pago",
      detalles: error.message
    });
  }
};

exports.actualizarEstadoPago = async (req, res) => {
  try {
    const { estado, transaccion_id } = req.body;
    const pagoActualizado = await ClassPago.actualizarEstado(
      req.params.id_pago,
      { estado, transaccion_id }
    );
    res.json({
      success: true,
      mensaje: "Estado de pago actualizado",
      data: pagoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error al actualizar pago",
      detalles: error.message
    });
  }
};