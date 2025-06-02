import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, eliminarProyecto } from '../../api/projects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // useQuery con objeto de opciones y tipos
  const {
    data: proyecto,
    isLoading,
    isError,
    error,
  } = useQuery<Proyecto, Error>({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

  // useMutation con objeto de opciones
  const eliminarMutation = useMutation({
    mutationFn: () => eliminarProyecto(token!, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      alert(error.message || 'Error al eliminar proyecto');
    },
  });

  if (isLoading) {
    return <p className="p-8 text-gray-500">Cargando proyecto...</p>;
  }

  if (isError) {
    return <p className="p-8 text-red-500">Error: {error?.message}</p>;
  }

  if (!proyecto) {
    return <p className="p-8 text-gray-500">Proyecto no encontrado</p>;
  }

  const handleEliminar = () => {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este proyecto?');
    if (confirmacion) eliminarMutation.mutate();
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
      </button>
      <button
        onClick={handleEliminar}
        disabled={eliminarMutation.isPending}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-2"
      >
        {eliminarMutation.isPending ? 'Eliminando...' : '🗑️ Eliminar proyecto'}
      </button>
    </div>
  );
};
