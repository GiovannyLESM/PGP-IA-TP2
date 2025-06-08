import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, actualizarProyecto } from '../../api/projects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';

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

  const { data: proyecto, isLoading, isError, error } = useQuery<Proyecto, Error>({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

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

    if (!form.nombre || !form.descripcion) {
      setLocalError('Todos los campos son obligatorios');
      return;
    }

    mutation.mutate(form);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <div className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Cargando proyecto...</div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <div className="text-lg text-red-500 dark:text-red-400">{error?.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              ✏️ Editar Proyecto
            </h1>

            {localError && <p className="text-red-500 dark:text-red-400 mb-4">{localError}</p>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Nombre del proyecto</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del proyecto"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">Descripción</label>
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción"
                  value={form.descripcion}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Puedes agregar más campos aquí si lo necesitas */}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${id}`)}
                  className="text-red-600 hover:underline dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold transition"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
};
