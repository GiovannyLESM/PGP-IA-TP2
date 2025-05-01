// src/modules/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../../components/ProjectCard';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { nombre } = JSON.parse(storedUser);
      setNombre(nombre);
    }

    const storedProyectos = localStorage.getItem('proyectos');
    if (storedProyectos) {
      setProyectos(JSON.parse(storedProyectos));
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {nombre} 👋</h1>

      {/* Botones de navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <button
          onClick={() => navigate('/projects/new')}
          className="bg-indigo-500 text-white p-4 rounded shadow hover:bg-indigo-600"
        >
          ➕ Crear nuevo proyecto
        </button>

        <button
          onClick={() => navigate('/projects')}
          className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600"
        >
          🗂️ Proyectos
        </button>

        <button
          onClick={() => navigate('/kanban')}
          className="bg-green-500 text-white p-4 rounded shadow hover:bg-green-600"
        >
          📌 Kanban
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="bg-purple-500 text-white p-4 rounded shadow hover:bg-purple-600"
        >
          💬 Chat
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="bg-yellow-500 text-white p-4 rounded shadow hover:bg-yellow-600"
        >
          👤 Perfil
        </button>
      </div>

      {/* Lista dinámica de proyectos */}
      <h2 className="text-2xl font-semibold mb-4">📁 Proyectos recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proyectos.map((proyecto) => (
          <ProjectCard
            key={proyecto.id}
            id={proyecto.id}
            nombre={proyecto.nombre}
            descripcion={proyecto.descripcion}
            estado={proyecto.estado}
            fecha={proyecto.fecha}
          />
        ))}
      </div>
    </div>
  );
};
