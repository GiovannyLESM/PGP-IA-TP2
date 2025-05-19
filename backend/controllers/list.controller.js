import { List } from '../models/List.js';
import { Project } from '../models/Project.js';

export const crearLista = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;
    const { nombre, posicion } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: 'El nombre de la lista es obligatorio' });
    }

    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    // Verifica si el usuario es miembro
    const esMiembro = proyecto.miembros.some((m) =>
      m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes permiso para agregar listas' });
    }

    const nuevaLista = new List({
      nombre,
      posicion,
      proyectoId,
    });

    const guardada = await nuevaLista.save();
    res.status(201).json({ msg: 'Lista creada correctamente', lista: guardada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear la lista' });
  }
};

export const obtenerListasPorProyecto = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;

    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario.toString() === req.user._id.toString()
    );
    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes acceso a este proyecto' });
    }

    const listas = await List.find({ proyectoId }).sort({ posicion: 1 });

    res.status(200).json(listas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener listas' });
  }
};