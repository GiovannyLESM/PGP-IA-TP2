import { useParams, useNavigate } from 'react-router-dom';
import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { obtenerProyectoPorId, eliminarProyecto } from '../../api/projects';
import { Layout } from '../../components/Layout';
const buscarUsuarioPorCorreo = async (token: string, correo: string) => {
  const res = await fetch(`http://localhost:5000/api/users/buscar?correo=${correo}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
};

const enviarInvitacion = async (token: string, proyectoId: string, correo: string) => {
  const res = await fetch(`http://localhost:5000/api/projects/${proyectoId}/invitaciones`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ correo })
  });
  if (!res.ok) throw new Error('No se pudo enviar la invitación');
  return res.json();
};

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, usuario } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [correo, setCorreo] = useState('');
  const [sugerencia, setSugerencia] = useState<any | null>(null);
  const [loadingSugerencia, setLoadingSugerencia] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorInvitacion, setErrorInvitacion] = useState('');

  const {
    data: proyecto,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['proyecto', id],
    queryFn: () => obtenerProyectoPorId(token!, id!),
    enabled: !!token && !!id,
  });

  const esPropietario = !!usuario && proyecto?.miembros?.some(
    (m: any) => m.usuario && (m.usuario._id === (usuario as any)._id) && m.rol === 'propietario'
  );

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

  const handleBuscarUsuario = async (value: string) => {
    setCorreo(value);
    setMensaje('');
    setErrorInvitacion('');
    setSugerencia(null);
    if (value.length < 3) return;
    setLoadingSugerencia(true);
    try {
      const user = await buscarUsuarioPorCorreo(token!, value);
      setSugerencia(user);
    } catch {
      setSugerencia(null);
    }
    setLoadingSugerencia(false);
  };

  const mutation = useMutation({
    mutationFn: () => enviarInvitacion(token!, id!, correo),
    onSuccess: () => {
      setMensaje('Invitación enviada correctamente');
      setCorreo('');
      setSugerencia(null);
    },
    onError: (err: any) => {
      setErrorInvitacion(err.message || 'Error al invitar');
    }
  });

  if (isLoading) return <p className="p-8 text-gray-500 dark:text-gray-400">Cargando proyecto...</p>;
  if (isError) return <p className="p-8 text-red-500 dark:text-red-400">Error: {error?.message}</p>;
  if (!proyecto) return <p className="p-8 text-gray-500 dark:text-gray-400">Proyecto no encontrado</p>;

  const handleEliminar = () => {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este proyecto?');
    if (confirmacion) eliminarMutation.mutate();
  };

  return (
    <Layout>

      <div className="p-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Volver
        </button>

        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{proyecto.nombre}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-2">{proyecto.descripcion}</p>
        <p className="text-sm mb-1 text-gray-800 dark:text-gray-200">
          <strong>Estado:</strong> {proyecto.estado}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <strong>Fecha:</strong> {proyecto.fecha}
        </p>

        <button
          onClick={() => navigate(`/projects/${proyecto._id}/edit`)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          ✏️ Editar proyecto
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

        {esPropietario && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-500 transition ml-2"
            onClick={() => setShowModal(true)}
          >
            Invitar usuarios
          </button>
        )}

        <Transition appear show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-black dark:text-white p-6 shadow-xl transition-all relative">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Invitar usuario al proyecto
                    </Dialog.Title>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        mutation.mutate();
                      }}
                      className="mt-4"
                    >
                      <input
                        type="email"
                        className="w-full p-2 border rounded mb-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Correo"
                        value={correo}
                        onChange={e => handleBuscarUsuario(e.target.value)}
                        autoFocus
                      />
                      {loadingSugerencia && (
                        <div className="text-sm text-gray-400 dark:text-gray-300">Buscando...</div>
                      )}
                      {sugerencia && (
                        <div
                          className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-600"
                          onClick={() => setCorreo(sugerencia.correo)}
                        >
                          {sugerencia.nombre} ({sugerencia.correo})
                        </div>
                      )}
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2 hover:bg-blue-700 dark:hover:bg-blue-500"
                        disabled={mutation.isPending || !correo}
                      >
                        {mutation.isPending ? 'Enviando...' : 'Invitar'}
                      </button>
                      {mensaje && <div className="text-green-600 dark:text-green-400 mt-2">{mensaje}</div>}
                      {errorInvitacion && <div className="text-red-600 dark:text-red-400 mt-2">{errorInvitacion}</div>}
                    </form>
                    <button
                      className="absolute top-2 right-2 text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                      onClick={() => setShowModal(false)}
                    >
                      ✖
                    </button>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
};
