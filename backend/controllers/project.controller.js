import { Project } from '../models/Project.js';
import {User} from '../models/User.js'
import { Invitacion } from '../models/Invitaciones.js';
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
      $or: [
        { 'miembros.usuario': req.user._id },
        { creador: req.user._id }
      ]
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

export const agregarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, rol } = req.body;

    const proyecto = await Project.findById(id);
    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const propietario = proyecto.miembros.find(
      (m) =>
        m.usuario.toString() === req.user._id.toString() &&
        m.rol === 'propietario'
    );
    if (!propietario) {
      return res.status(403).json({ msg: 'Solo el propietario puede agregar miembros' });
    }

    const usuarioInvitado = await User.findOne({ correo });
    if (!usuarioInvitado) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const yaMiembro = proyecto.miembros.find(
      (m) => m.usuario.toString() === usuarioInvitado._id.toString()
    );
    if (yaMiembro) {
      return res.status(400).json({ msg: 'El usuario ya es miembro del proyecto' });
    }

    proyecto.miembros.push({
      usuario: usuarioInvitado._id,
      rol,
    });

    await proyecto.save();

    res.status(200).json({ msg: 'Miembro agregado correctamente' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ msg: 'Error al agregar miembro' });
  }
};

export const obtenerMiembros = async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Project.findById(id).populate('miembros.usuario', 'nombre correo');

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    const esMiembro = proyecto.miembros.some(
      (m) => m.usuario._id.toString() === req.user._id.toString()
    );

    if (!esMiembro) {
      return res.status(403).json({ msg: 'No tienes acceso a este proyecto' });
    }

    res.status(200).json(proyecto.miembros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los miembros' });
  }
};

export const eliminarMiembro = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const proyecto = await Project.findById(id);

    if (!proyecto) {
      return res.status(404).json({ msg: 'Proyecto no encontrado' });
    }

    // Verifica que el solicitante sea el propietario
    const propietario = proyecto.miembros.find(
      (m) =>
        m.usuario.toString() === req.user._id.toString() &&
        m.rol === 'propietario'
    );

    if (!propietario) {
      return res.status(403).json({ msg: 'Solo el propietario puede eliminar miembros' });
    }

    // No permitir que se elimine a sí mismo
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ msg: 'No puedes eliminarte a ti mismo del proyecto' });
    }

    // Elimina al miembro
    const miembrosFiltrados = proyecto.miembros.filter(
      (m) => m.usuario.toString() !== userId
    );

    proyecto.miembros = miembrosFiltrados;
    await proyecto.save();

    res.status(200).json({ msg: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al eliminar miembro' });
  }
};

export const invitarMiembro = async (req, res) => {
  const { correo } = req.body;
  const proyectoId = req.params.id;

  if (!correo) return res.status(400).json({ msg: 'Correo es requerido' });

  try {
    // Buscar usuario por correo
    const usuarioInvitado = await User.findOne({ correo: correo.toLowerCase().trim() });
    if (!usuarioInvitado) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Verifica si ya es miembro
    const proyecto = await Project.findById(proyectoId);
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });
    if (proyecto.miembros.includes(usuarioInvitado._id)) {
      return res.status(400).json({ msg: 'El usuario ya es miembro del proyecto' });
    }

    // Verifica si ya tiene una invitación pendiente
    const yaInvitado = await Invitacion.findOne({
      proyecto: proyectoId,
      usuarioInvitado: usuarioInvitado._id,
      estado: 'pendiente',
    });
    if (yaInvitado) return res.status(400).json({ msg: 'Ya existe una invitación pendiente para este usuario' });

    // Crea la invitación
    const invitacion = new Invitacion({
      proyecto: proyectoId,
      usuarioInvitado: usuarioInvitado._id,
      usuarioInvitador: req.user._id,
    });
    await invitacion.save();

    res.json({ msg: 'Invitación enviada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al invitar miembro' });
  }
};