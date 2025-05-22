import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId,eliminarProyecto } from '../../api/projects';

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        const data = await obtenerProyectoPorId(token!, id!);
        setProyecto(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el proyecto');
      }
    };

    if (token && id) cargarProyecto();
  }, [token, id]);

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  if (!proyecto) {
    return <p className="p-8 text-gray-500">Cargando proyecto...</p>;
  }

  const handleEliminar = async () => {
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar este proyecto?');
  if (!confirmacion) return;

  try {
    await eliminarProyecto(token!, id!);
    navigate('/dashboard');
  } catch (err: any) {
    console.error(err);
    alert(err.message || 'Error al eliminar proyecto');
  }
};

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold mb-2">{proyecto.nombre}</h1>
      <p className="text-gray-700 mb-2">{proyecto.descripcion}</p>
      <p className="text-sm mb-1">
        <strong>Estado:</strong> {proyecto.estado}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        <strong>Fecha:</strong> {proyecto.fecha}
      </p>

      <button
        onClick={() => navigate(`/projects/${proyecto._id}/edit`)}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        ✏️ Editar proyecto
      </button>
      <button
        onClick={() => navigate(`/projects/${proyecto._id}/tasks`)}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 ml-2"
      >
        📝 Ver tareas
      </button>
      <button
        onClick={() => navigate(`/projects/${proyecto._id}/kanban`)}
        className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 ml-2"
      >
        📌 Ver Kanban
      </button>
      <button
        onClick={() => navigate(`/projects/${proyecto._id}/chat`)}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-2"
      >
        💬 Ver Chat
      </button>.
      <button
        onClick={handleEliminar}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
      >
        🗑️ Eliminar proyecto
      </button>

    </div>
  );
};
