// controllers/planificacion.controller.js
import axios from 'axios';

export const generarPlan = async (req, res) => {
  const { descripcion } = req.body;

  try {
    console.log("📤 Enviando mensaje a Flask:", descripcion);
    const respuesta = await axios.post('http://langchain:5001/planificar', {
      mensaje: descripcion,
      sesion_id: req.user._id
    });

    res.status(200).json({ mensajeIA: respuesta.data.respuesta });
  } catch (error) {
      console.error('Error al generar planificación:', error.message);
      console.error(error.response?.data || error);
      res.status(500).json({ msg: 'No se pudo generar la planificación' });
    }
};
