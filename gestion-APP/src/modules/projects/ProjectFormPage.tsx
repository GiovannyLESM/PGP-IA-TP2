import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ProjectFormPage = () => {
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
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { nombre, descripcion, estado, fecha } = form;

    if (!nombre || !descripcion || !estado || !fecha) {
      return setError('Todos los campos son obligatorios');
    }

    // 🧪 Simular guardar el proyecto (puedes mejorar esto más adelante)
    const nuevoProyecto = {
      id: Date.now(), // ID único temporal
      ...form,
    };

    // Simulamos guardar en localStorage (puedes conectarlo a un service.js más adelante)
    const proyectosGuardados = JSON.parse(localStorage.getItem('proyectos') || '[]');
    localStorage.setItem('proyectos', JSON.stringify([...proyectosGuardados, nuevoProyecto]));

    console.log('Proyecto creado:', nuevoProyecto);

    navigate('/dashboard');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver
      </button>
      <h1 className="text-3xl font-bold mb-6">➕ Crear nuevo proyecto</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear proyecto
        </button>
      </form>
    </div>
  );
};
