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

export const editarTarjeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fechaInicio, fechaFin } = req.body;

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    const lista = await List.findById(tarjeta.listaId);
    const proyecto = await Project.findById(lista.proyectoId);

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario.toString() === req.user._id.toString()
    );

    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes permiso para editar esta tarjeta' });
    }

    // Actualizar campos permitidos
    if (titulo !== undefined) tarjeta.titulo = titulo;
    if (descripcion !== undefined) tarjeta.descripcion = descripcion;
    if (fechaInicio !== undefined) tarjeta.fechaInicio = fechaInicio;
    if (fechaFin !== undefined) tarjeta.fechaFin = fechaFin;

    const guardada = await tarjeta.save();

    res.status(200).json({ msg: 'Tarjeta actualizada', tarjeta: guardada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al editar la tarjeta' });
  }
};

export const asignarMiembros = async (req, res) => {
  try {
    const { id } = req.params;
    const { miembros } = req.body; // array de IDs de usuarios

    if (!Array.isArray(miembros)) {
      return res.status(400).json({ msg: 'Se debe enviar un array de IDs de miembros' });
    }

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    const lista = await List.findById(tarjeta.listaId);
    const proyecto = await Project.findById(lista.proyectoId);

    // Verifica que todos los miembros asignados pertenezcan al proyecto
    const idsMiembrosProyecto = proyecto.miembros.map((m) => m.usuario.toString());
    const todosSonMiembros = miembros.every((id) =>
      idsMiembrosProyecto.includes(id)
    );

    if (!todosSonMiembros) {
      return res.status(400).json({ msg: 'Uno o más usuarios no son miembros del proyecto' });
    }

    tarjeta.miembros = miembros;
    const actualizada = await tarjeta.save();

    res.status(200).json({ msg: 'Miembros asignados correctamente', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al asignar miembros' });
  }
};

export const agregarChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: 'El nombre del ítem es obligatorio' });
    }

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    tarjeta.checklist.push({ nombre, completado: false });

    const actualizada = await tarjeta.save();
    res.status(200).json({ msg: 'Ítem añadido al checklist', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar ítem al checklist' });
  }
};

export const actualizarChecklistItem = async (req, res) => {
  try {
    const { cardId, index } = req.params;
    const { completado } = req.body;

    const tarjeta = await Card.findById(cardId);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    if (!tarjeta.checklist[index]) {
      return res.status(400).json({ msg: 'Ítem de checklist no existe' });
    }

    tarjeta.checklist[index].completado = Boolean(completado);
    const actualizada = await tarjeta.save();

    res.status(200).json({ msg: 'Checklist actualizado', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar el checklist' });
  }
};

export const eliminarChecklistItem = async (req, res) => {
  try {
    const { cardId, index } = req.params;

    const tarjeta = await Card.findById(cardId);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    if (!tarjeta.checklist[index]) {
      return res.status(400).json({ msg: 'Ítem no encontrado en el checklist' });
    }

    tarjeta.checklist.splice(index, 1);
    const actualizada = await tarjeta.save();

    res.status(200).json({ msg: 'Ítem eliminado', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar el ítem del checklist' });
  }
};
