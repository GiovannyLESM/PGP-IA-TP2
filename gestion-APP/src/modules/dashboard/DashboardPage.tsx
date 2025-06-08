import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../../components/ProjectCard';
import { Layout } from '../../components/Layout';
import { obtenerProyectos } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '../../components/Sidebar';

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { usuario, token } = useAuth();

  const {
    data: proyectos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Proyecto[], Error>({
    queryKey: ['proyectos', token],
    queryFn: () => obtenerProyectos(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <div className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Cargando proyectos...</div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <div className="text-lg text-red-500 dark:text-red-400">{error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Sidebar />

        <main className="flex-1 flex flex-col items-center p-4 md:p-10">
          {/* Card de bienvenida y acciones */}
          <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-10 mt-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              Bienvenido, {usuario?.nombre} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Gestiona tus proyectos, colabora con tu equipo y mantente productivo.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/projects/new')}
                className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-3 rounded-lg shadow hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition"
              >
                <span className="text-xl">➕</span>
                <span>Nuevo proyecto</span>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-2 bg-purple-500 text-white px-5 py-3 rounded-lg shadow hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800 transition"
              >
                <span className="text-xl">💬</span>
                <span>Chat</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-yellow-500 text-white px-5 py-3 rounded-lg shadow hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800 transition"
              >
                <span className="text-xl">👤</span>
                <span>Perfil</span>
              </button>
            </div>
          </div>

          {/* Lista dinámica de proyectos */}
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">📁 Proyectos recientes</h2>
            {proyectos.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow">
                No tienes proyectos aún. ¡Crea uno nuevo para empezar!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proyectos.map((proyecto) => (
                  <ProjectCard
                    key={proyecto._id}
                    id={proyecto._id}
                    nombre={proyecto.nombre}
                    descripcion={proyecto.descripcion}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};
