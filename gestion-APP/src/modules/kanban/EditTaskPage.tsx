// src/modules/kanban/EditTaskPage.tsx
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

export const EditTaskPage = () => {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    fecha: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('tareas');
    if (stored) {
      const tareas: Tarea[] = JSON.parse(stored);
      const tarea = tareas.find(t => t.id === Number(taskId) && t.proyectoId === Number(projectId));
      if (tarea) {
        setForm({
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          estado: tarea.estado,
          fecha: tarea.fecha,
        });
      } else {
        setError('Tarea no encontrada');
      }
    }
  }, [projectId, taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('tareas');
    if (!stored) return;

    const tareas: Tarea[] = JSON.parse(stored);
    const actualizadas = tareas.map(t =>
      t.id === Number(taskId) && t.proyectoId === Number(projectId)
        ? { ...t, ...form }
        : t
    );

    localStorage.setItem('tareas', JSON.stringify(actualizadas));
    navigate(`/projects/${projectId}/kanban`);
  };

  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✏️ Editar Tarea</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Título"
        />
        <input
          type="text"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Descripción"
        />
        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Hecha">Hecha</option>
        </select>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/kanban`)}
            className="text-gray-600 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
