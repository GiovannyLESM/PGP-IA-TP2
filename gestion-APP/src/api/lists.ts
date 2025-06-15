import { API_BASE_URL } from './config';
export const obtenerListasPorProyecto = async (token: string, proyectoId: string) => {
  const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}/listas`, {
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
  const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}/listas`, {
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
