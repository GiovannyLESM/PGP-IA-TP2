import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../../components/ProjectCard';
import { Layout } from '../../components/Layout';
import { obtenerProyectos } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';

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
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerProyectos(token!);
        setProyectos(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al cargar proyectos');
      }
    };

    if (token) cargar();
  }, [token]);

  return (
    <Layout>
      <div className="min-h-screen p-8 bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <h1 className="text-3xl font-bold mb-4">
          Bienvenido, {usuario?.nombre} 👋
        </h1>

        {/* Botones de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <button
            onClick={() => navigate('/projects/new')}
            className="bg-indigo-500 text-white p-4 rounded shadow hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            ➕ Crear nuevo proyecto
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="bg-purple-500 text-white p-4 rounded shadow hover:bg-purple-600 dark:bg-purple-700 dark:hover:bg-purple-800"
          >
            💬 Chat
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-yellow-500 text-white p-4 rounded shadow hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800"
          >
            👤 Perfil
          </button>
        </div>

        {/* Lista dinámica de proyectos */}
        <h2 className="text-2xl font-semibold mb-4">📁 Proyectos recientes</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proyectos.map((proyecto) => (
            <ProjectCard
              key={proyecto._id}
              id={proyecto._id}
              nombre={proyecto.nombre}
              descripcion={proyecto.descripcion}
              estado={proyecto.estado}
              fecha={proyecto.fecha}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};
