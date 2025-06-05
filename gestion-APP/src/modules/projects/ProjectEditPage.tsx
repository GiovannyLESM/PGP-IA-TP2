import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, actualizarProyecto } from '../../api/projects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

type ProyectoForm = {
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
};

export const ProjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ProyectoForm>({
    nombre: '',
    descripcion: '',
    estado: '',
    fecha: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // useQuery sin onSuccess
  const { data: proyecto, isLoading, isError, error } = useQuery<Proyecto, Error>({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

  // Usa useEffect para actualizar el formulario cuando 'proyecto' cambie
  useEffect(() => {
    if (proyecto) {
      setForm({
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        estado: proyecto.estado,
        fecha: proyecto.fecha,
      });
    }
  }, [proyecto]);

  const mutation = useMutation({
    mutationFn: (updatedProject: ProyectoForm) => actualizarProyecto(token!, id!, updatedProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyecto', id] });
      navigate(`/projects/${id}`);
    },
    onError: (error: any) => {
      setLocalError(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre || !form.descripcion || !form.estado || !form.fecha) {
      setLocalError('Todos los campos son obligatorios');
      return;
    }

    mutation.mutate(form);
  };

  if (isLoading) {
    return <p className="p-8 text-gray-500">Cargando proyecto...</p>;
  }

  if (isError) {
    return <p className="p-8 text-red-500">Error: {error?.message}</p>;
  }

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto text-black dark:text-white">
        <h1 className="text-3xl font-bold mb-6">✏️ Editar Proyecto</h1>

        {localError && <p className="text-red-500 dark:text-red-400 mb-4">{localError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del proyecto"
            value={form.nombre}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />

          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="Planeado">Planeado</option>
            <option value="En progreso">En progreso</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="text-red-600 hover:underline dark:text-red-400 dark:hover:text-red-300"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
);

};
