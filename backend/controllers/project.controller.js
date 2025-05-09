import { Project } from '../models/Project.js';

export const crearProyecto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: 'El nombre del proyecto es obligatorio' });
    }

    const nuevoProyecto = new Project({
      nombre,
      descripcion,
      creador: req.user._id, // el usuario autenticado
      miembros: [
        {
          usuario: req.user._id,
          rol: 'propietario',
        },
      ],
    });

    const proyectoGuardado = await nuevoProyecto.save();

    res.status(201).json({
      msg: 'Proyecto creado correctamente',
      proyecto: proyectoGuardado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al crear el proyecto' });
  }
};

export const obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Project.find({
      'miembros.usuario': req.user._id,
    }).populate('miembros.usuario', 'nombre correo');

    res.status(200).json(proyectos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener proyectos' });
  }
};

export const obtenerProyectoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Project.findById(id)
      .populate('miembros.usuario', 'nombre correo');

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    // Verificar si el usuario forma parte del proyecto
    const esMiembro = proyecto.miembros.some((miembro) =>
      miembro.usuario._id.equals(req.user._id)
    );

    if (!esMiembro) {
      return res.status(403).json({ msg: 'Acceso denegado a este proyecto' });
    }

    res.status(200).json(proyecto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener el proyecto' });
  }
};

export const editarProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Project.findById(id);

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    // Verificamos que el usuario sea el propietario
    const propietario = proyecto.miembros.find(
      (miembro) =>
        miembro.usuario.toString() === req.user._id.toString() &&
        miembro.rol === 'propietario'
    );

    if (!propietario) {
      return res.status(403).json({ msg: 'Solo el propietario puede editar el proyecto' });
    }

    // Actualizamos los campos permitidos
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;

    const proyectoActualizado = await proyecto.save();

    res.status(200).json({
      msg: 'Proyecto actualizado correctamente',
      proyecto: proyectoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al editar el proyecto' });
  }
};

export const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Project.findById(id);

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const propietario = proyecto.miembros.find(
      (miembro) =>
        miembro.usuario.toString() === req.user._id.toString() &&
        miembro.rol === 'propietario'
    );

    if (!propietario) {
      return res.status(403).json({ msg: 'Solo el propietario puede eliminar el proyecto' });
    }

    await proyecto.deleteOne();

    res.status(200).json({ msg: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar el proyecto' });
  }
};
