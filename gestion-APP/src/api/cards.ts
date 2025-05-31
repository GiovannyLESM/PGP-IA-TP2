export const obtenerCardsPorLista = async (token: string, listaId: string) => {
  const res = await fetch(`http://localhost:5000/api/listas/${listaId}/tarjetas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener tarjetas');
  return data;
};

export const crearCardEnLista = async (
  token: string,
  listaId: string,
  data: {
    titulo: string;
    descripcion: string;
  }
) => {
  const res = await fetch(`http://localhost:5000/api/listas/${listaId}/tarjetas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al crear tarjeta');
  return result;
};

export const actualizarFechasCard = async (
  token: string,
  cardId: string,
  fechas: { fechaInicio?: string; fechaFin?: string }
) => {
  const res = await fetch(`http://localhost:5000/api/tarjetas/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fechas),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al actualizar fechas');
  return data;
};