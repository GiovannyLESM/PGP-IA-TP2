export const obtenerListasPorProyecto = async (token: string, proyectoId: string) => {
  const res = await fetch(`http://localhost:5000/api/projects/${proyectoId}/listas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener listas');
  return data;
};

export const crearLista = async (
  token: string,
  proyectoId: string,
  nombre: string
) => {
  const res = await fetch(`http://localhost:5000/api/projects/${proyectoId}/listas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al crear la lista');
  return data;
};
