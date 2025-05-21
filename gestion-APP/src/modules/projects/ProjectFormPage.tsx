import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProyecto } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';

export const ProjectFormPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    estado: '',
    fecha: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, descripcion, estado, fecha } = form;

    if (!nombre || !descripcion || !estado || !fecha) {
      return setError('Todos los campos son obligatorios');
    }

    try {
      const nuevo = await crearProyecto(token!, form);
      navigate(`/projects/${nuevo._id}`); // o navigate('/dashboard')
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al crear el proyecto');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6">➕ Nuevo Proyecto</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-red-600 hover:underline"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Crear proyecto
          </button>
        </div>
      </form>
    </div>
  );
};
