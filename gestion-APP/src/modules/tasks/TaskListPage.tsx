import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Tarea {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En progreso' | 'Hecha';
  fecha: string;
}

export const TaskListPage = () => {
  const { id } = useParams(); // ID del proyecto
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);

  useEffect(() => {
    const storedTareas = localStorage.getItem('tareas');
    if (storedTareas) {
      const todas = JSON.parse(storedTareas);
      const tareasFiltradas = todas.filter((t: Tarea) => t.proyectoId === Number(id));
      setTareas(tareasFiltradas);
    }
  }, [id]);

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver al proyecto
      </button>

      <h1 className="text-2xl font-bold mb-4">📝 Tareas del proyecto {id}</h1>

      <button
        onClick={() => navigate(`/projects/${id}/tasks/new`)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
      >
        ➕ Nueva tarea
      </button>

      {tareas.length === 0 ? (
        <p className="text-gray-600">Este proyecto aún no tiene tareas.</p>
      ) : (
        <ul className="space-y-3">
          {tareas.map((tarea) => (
            <li
              key={tarea.id}
              className="border rounded p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{tarea.titulo}</h3>
              <p className="text-sm text-gray-600">{tarea.descripcion}</p>
              <p className="text-xs text-gray-500">
                Estado: {tarea.estado} | Fecha: {tarea.fecha}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
