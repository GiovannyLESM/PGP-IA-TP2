// src/modules/dashboard/ProjectDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);

  useEffect(() => {
    const storedProyectos = localStorage.getItem('proyectos');
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      const encontrado = proyectos.find((p: Proyecto) => p.id === Number(id));
      setProyecto(encontrado ?? null);
    }
  }, [id]);

  if (!proyecto) {
    return <p className="p-8 text-red-500">Proyecto no encontrado.</p>;
  }

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

      {/* Botón para editar */}
      <button
        onClick={() => navigate(`/projects/${proyecto.id}/edit`)}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        ✏️ Editar proyecto
      </button>
      <button
        onClick={() => navigate(`/projects/${proyecto.id}/tasks`)}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 ml-2"
        >
        📝 Ver tareas
        </button>
        <button
        onClick={() => navigate(`/projects/${proyecto.id}/kanban`)}
        className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 ml-2"
        >
        📌 Ver Kanban
      </button>
      <button
        onClick={() => navigate(`/projects/${proyecto.id}/chat`)}
        className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 ml-2"
      >
        💬 Ver Chat
      </button>
    </div>
  );
};
