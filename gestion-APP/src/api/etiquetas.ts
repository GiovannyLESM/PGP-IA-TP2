const base = 'http://localhost:5000/api';

export const obtenerEtiquetas = async (token: string, cardId: string) => {
  const res = await fetch(`${base}/cards/${cardId}/etiquetas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener etiquetas');
  return data;
};

export const agregarEtiqueta = async (
  token: string,
  cardId: string,
  etiqueta: { nombre: string; color: string }
) => {
  const res = await fetch(`${base}/cards/${cardId}/etiquetas`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(etiqueta),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al agregar etiqueta');
  return data;
};

export const eliminarEtiqueta = async (
  token: string,
  cardId: string,
  index: number
) => {
  const res = await fetch(`${base}/cards/${cardId}/etiquetas/${index}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al eliminar etiqueta');
  return data;
};
