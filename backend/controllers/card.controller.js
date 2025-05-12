import { Card } from '../models/Card.js';
import { List } from '../models/List.js';
import { Project } from '../models/Project.js';

export const crearTarjeta = async (req, res) => {
  try {
    const { id: listaId } = req.params;
    const { titulo, descripcion, fechaInicio, fechaFin } = req.body;

    if (!titulo) {
      return res.status(400).json({ msg: 'El título es obligatorio' });
    }

    const lista = await List.findById(listaId);
    if (!lista) {
      return res.status(404).json({ msg: 'Lista no encontrada' });
    }

    const proyecto = await Project.findById(lista.proyectoId);
    const esMiembro = proyecto.miembros.some((m) =>
      m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes permiso para agregar tarjetas' });
    }

    const nuevaCard = new Card({
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      listaId,
    });

    const guardada = await nuevaCard.save();
    res.status(201).json({ msg: 'Tarjeta creada correctamente', tarjeta: guardada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la tarjeta' });
  }
};
