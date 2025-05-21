// src/api/projects.ts
export const obtenerProyectos = async (token: string) => {
  const res = await fetch('http://localhost:5000/api/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al cargar proyectos');
  return data;
};

export const crearProyecto = async (token: string, proyecto: {
  nombre: string;
  descripcion: string;
  estado: string;
  fecha: string;
}) => {
  const res = await fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(proyecto),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al crear proyecto');
  return data; // el proyecto creado
};

export const obtenerProyectoPorId = async (token: string, id: string) => {
  const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Proyecto no encontrado');
  return data;
};
