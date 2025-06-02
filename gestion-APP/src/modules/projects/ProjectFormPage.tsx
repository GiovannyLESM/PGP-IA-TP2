import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearProyecto } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';
import { useMutation } from '@tanstack/react-query';

type ProyectoForm = {
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
};

type ProyectoResponse = {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
  // otros campos que pueda devolver tu backend
};

export const ProjectFormPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProyectoForm>({
    nombre: '',
    descripcion: '',
    estado: '',
    fecha: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const mutation = useMutation<ProyectoResponse, Error, ProyectoForm>({
    mutationFn: (newProject) => crearProyecto(token!, newProject),
    onError: (error) => {
      setLocalError(error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, descripcion, estado, fecha } = form;

    if (!nombre || !descripcion || !estado || !fecha) {
      return setLocalError('Todos los campos son obligatorios');
    }

    try {
      const nuevo = await mutation.mutateAsync(form);
      console.log('Proyecto creado:', nuevo);

      if (!nuevo._id) {
        setLocalError('Error: el proyecto creado no tiene ID');
        return;
      }

      navigate(`/projects/${nuevo._id}`);
    } catch (error: any) {
      setLocalError(error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6">➕ Nuevo Proyecto</h1>

      {localError && <p className="text-red-500 mb-4">{localError}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
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
          required
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
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creando...' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
};
