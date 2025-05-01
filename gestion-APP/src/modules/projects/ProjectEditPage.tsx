// src/modules/projects/ProjectEditPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ProjectEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    estado: '',
    fecha: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const storedProyectos = localStorage.getItem('proyectos');
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      const proyecto = proyectos.find((p: any) => p.id === Number(id));

      if (proyecto) {
        setForm({
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          fecha: proyecto.fecha,
        });
      } else {
        setError('Proyecto no encontrado');
      }
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nombre || !form.descripcion || !form.estado || !form.fecha) {
      return setError('Todos los campos son obligatorios');
    }

    const storedProyectos = localStorage.getItem('proyectos');
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      const index = proyectos.findIndex((p: any) => p.id === Number(id));

      if (index !== -1) {
        proyectos[index] = { id: Number(id), ...form };
        localStorage.setItem('proyectos', JSON.stringify(proyectos));
        navigate(`/projects/${id}`);
      } else {
        setError('No se pudo actualizar el proyecto (no encontrado)');
      }
    } else {
      setError('No hay proyectos registrados');
    }
  };

  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✏️ Editar Proyecto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del proyecto"
          value={form.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
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
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
};
