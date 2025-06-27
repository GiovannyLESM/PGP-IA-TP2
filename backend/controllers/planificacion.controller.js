// controllers/planificacion.controller.js
import axios from 'axios';
import { List } from '../models/List.js';
import { Card } from '../models/Card.js';
import { Project } from '../models/Project.js';

const LANGCHAIN_URL = process.env.LANGCHAIN_URL || 'http://192.168:5001';

// Función auxiliar para reintentos con backoff exponencial
async function llamarLangChainConReintentos(data, intentos = 3, delay = 2000) {
  let lastError;
  for (let i = 0; i < intentos; i++) {
    try {
      return await axios.post(`${LANGCHAIN_URL}/planificar`, data, { timeout: 30000 });
    } catch (error) {
      lastError = error;
      // Si es el último intento, lanza el error
      if (i === intentos - 1) throw error;
      // Solo reintenta si es error de red o timeout o 5xx
      if (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ECONNABORTED' ||
        (error.response && [502, 503, 504].includes(error.response.status))
      ) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // backoff exponencial
      } else {
        // Otros errores no se reintentan
        throw error;
      }
    }
  }
  throw lastError;
}

export const generarPlan = async (req, res) => {
  const { descripcion, proyectoId } = req.body;

  if (!descripcion || !proyectoId) {
    return res.status(400).json({ msg: 'Descripción y proyectoId son requeridos' });
  }

  try {
    // 1. Enviar mensaje a la IA (Flask/LangChain) con reintentos
    const respuesta = await llamarLangChainConReintentos({
      mensaje: descripcion,
      sesion_id: req.user._id
    });

    const mensajeIA = respuesta.data.respuesta;

    // 2. Intentar parsear el JSON si existe
    let planJSON = null;
    try {
      const match = mensajeIA.match(/\{[\s\S]*\}/);
      if (match) planJSON = JSON.parse(match[0]);
    } catch (e) {
      // No hay JSON, solo explicación
    }

    // 3. Si hay JSON, crear listas y tareas
    if (planJSON && planJSON.listas) {
      const creadas = [];
      for (const lista of planJSON.listas) {
        const nuevaLista = new List({
          nombre: lista.nombre,
          proyectoId,
        });
        const listaGuardada = await nuevaLista.save();

        for (const tarea of (lista.tareas || [])) {
          const nuevaCard = new Card({
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            listaId: listaGuardada._id,
            etiquetas: Array.isArray(tarea.etiquetas) ? tarea.etiquetas.map(e => ({
              nombre: e.nombre || '',
              color: e.color || '#000000'
            })) : [],
            checklist: Array.isArray(tarea.checklist) ? tarea.checklist.map(c => ({
              nombre: c.nombre || '',
              completado: !!c.completado
            })) : [],
          });
          await nuevaCard.save();
        }
        creadas.push(listaGuardada);
      }
      return res.status(201).json({ msg: 'Planificación creada', listas: creadas });
    }

    // 4. Si no hay JSON, solo envía la explicación al frontend
    res.status(200).json({ mensajeIA });

  } catch (error) {
    console.error('Error en /api/planificar:', error);

    // Manejo de errores específico
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ msg: 'No se pudo conectar con la IA. Puede estar apagada, dormida o en proceso de arranque.' });
    }
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ msg: 'La IA tardó demasiado en responder. Puede estar dormida, intenta en unos segundos.' });
    }
    if (error.response && error.response.status === 404) {
      return res.status(502).json({ msg: 'El endpoint de la IA no fue encontrado (404).' });
    }
    return res.status(500).json({ msg: 'No se pudo generar la planificación por un error interno.' });
  }
};
