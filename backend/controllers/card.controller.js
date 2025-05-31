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
    const { nombre, completado } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    if (!card.checklist[index])
      return res.status(404).json({ msg: 'Ítem no encontrado' });

    // Actualizar ítem
    card.checklist[index] = { nombre, completado };

    await card.save();
    res.json(card.checklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al actualizar ítem del checklist' });
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

export const agregarAdjunto = async(req, res) =>{
  try{
    const { id } = req.params;
    const {nombre, url} = req.body;

    if(!nombre || !url){
      return res.status(400).json({msg:'Nombre y URL son obligatorios'})
    }
    const tarjeta = await Card.findById(id);
    if(!tarjeta){
      return res.status(400).json({msg:'Tarjeta no encontrada'})
    }
    tarjeta.adjuntos.push({nombre, url});

    const actualizada = await tarjeta.save()
    res.status(200).json({msg:'Adjunto agregado correctamente', tarjeta: actualizada})
  } catch(error){
    console.log(error);
    res.status(500).json({msg:'Error al agregar adjunto'})
  }
}
export const eliminarAdjunto = async (req, res) => {
  try {
    const { id, index } = req.params;

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    if (!tarjeta.adjuntos[index]) {
      return res.status(400).json({ msg: 'Adjunto no encontrado' });
    }

    tarjeta.adjuntos.splice(index, 1);
    const actualizada = await tarjeta.save();

    res.status(200).json({ msg: 'Adjunto eliminado', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar adjunto' });
  }
};

export const agregarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, color } = req.body;

    if (!nombre || !color) {
      return res.status(400).json({ msg: 'Nombre y color son obligatorios' });
    }

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    tarjeta.etiquetas.push({ nombre, color });

    const actualizada = await tarjeta.save();
    res.status(200).json({ msg: 'Etiqueta agregada', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al agregar etiqueta' });
  }
};

export const eliminarEtiqueta = async (req, res) => {
  try {
    const { id, index } = req.params;

    const tarjeta = await Card.findById(id);
    if (!tarjeta) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    if (!tarjeta.etiquetas[index]) {
      return res.status(400).json({ msg: 'Etiqueta no encontrada' });
    }

    tarjeta.etiquetas.splice(index, 1);
    const actualizada = await tarjeta.save();

    res.status(200).json({ msg: 'Etiqueta eliminada', tarjeta: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar etiqueta' });
  }
};

export const reordenarTarjetas = async (req, res) => {
  try {
    const { id: listaId } = req.params;
    const { tarjetas } = req.body;

    // tarjetas debe ser un array de objetos: [{ id: '...', posicion: 0 }, ...]
    if (!Array.isArray(tarjetas)) {
      return res.status(400).json({ msg: 'Debes enviar un arreglo de tarjetas con posición' });
    }

    for (const tarjeta of tarjetas) {
      await Card.findOneAndUpdate(
        { _id: tarjeta.id, listaId },
        { posicion: tarjeta.posicion }
      );
    }

    res.status(200).json({ msg: 'Tarjetas reordenadas correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al reordenar tarjetas' });
  }
};

import mongoose from 'mongoose';

export const obtenerTarjetasPorLista = async (req, res) => {
  try {
    const { id: listaId } = req.params;

    // Validación rápida para ObjectId
    if (!mongoose.Types.ObjectId.isValid(listaId)) {
      return res.status(400).json({ msg: 'ID de lista inválido' });
    }

    const lista = await List.findById(listaId);
    if (!lista) {
      return res.status(200).json([]); // Lista no encontrada aún, puede estar en proceso de creación
    }

    const proyecto = await Project.findById(lista.proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes permiso para ver las tarjetas' });
    }

    const tarjetas = await Card.find({ listaId }).sort({ posicion: 1 });
    res.status(200).json(tarjetas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener tarjetas' });
  }
};


export const moverCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaListaId } = req.body;

    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    card.listaId = nuevaListaId;
    await card.save();

    res.json({ msg: 'Tarjeta movida correctamente' });
  } catch (error) {
    res.status(500).json({ msg: 'Error al mover tarjeta' });
  }
};

export const actualizarEstadoCompletada = async (req, res) => {
  try {
    const { id } = req.params;
    const { completada } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    card.completada = completada;
    await card.save();

    res.json({ msg: 'Estado actualizado', card });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ msg: 'Error al actualizar estado' });
  }
};

export const obtenerChecklist = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    res.json(card.checklist || []);
  } catch (error) {
    console.error('Error al obtener checklist:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

export const obtenerEtiquetasCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ msg: 'Tarjeta no encontrada' });
    }

    res.json(card.etiquetas || []);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ msg: 'Error al obtener etiquetas' });
  }
};

export const actualizarTarjeta = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body; // puede venir uno o más campos

    const tarjeta = await Card.findById(id);
    if (!tarjeta) return res.status(404).json({ msg: 'Tarjeta no encontrada' });

    // Solo actualiza los campos permitidos
    const camposPermitidos = ['titulo', 'descripcion', 'fechaInicio', 'fechaFin'];
    camposPermitidos.forEach((campo) => {
      if (campos[campo] !== undefined) {
        tarjeta[campo] = campos[campo];
      }
    });

    await tarjeta.save();

    res.json({ msg: 'Tarjeta actualizada correctamente', tarjeta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al actualizar la tarjeta' });
  }
};