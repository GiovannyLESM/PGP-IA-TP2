// controllers/planificacion.controller.js
import axios from 'axios';

/**
 * Controlador para enviar mensajes del usuario al microservicio LangChain (Flask)
 * y devolver la respuesta generada por IA al frontend.
 */
export const generarPlan = async (req, res) => {
  const { descripcion } = req.body;

  // Validación mínima
  if (!descripcion) {
    return res.status(400).json({ msg: 'La descripción es requerida' });
  }

  try {
    // Log para depuración
    console.log("Enviando mensaje a Flask:", descripcion);

    // Llamada al servicio Flask (langchain-api)
    const respuesta = await axios.post('http://langchain:5001/planificar', {
      mensaje: descripcion,
      sesion_id: req.user._id  // Sesión única por usuario
    });

    // Devolver solo la respuesta generada por IA al frontends
    res.status(200).json({ mensajeIA: respuesta.data.respuesta });

  } catch (error) {
    console.error('Error al generar planificación:', error.message);
    console.error(error.response?.data || error);
    res.status(500).json({ msg: 'No se pudo generar la planificación' });
  }
};