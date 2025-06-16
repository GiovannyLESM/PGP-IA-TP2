import { API_BASE_URL } from "./config";

export const obtenerCardsPorLista = async (token: string, listaId: string) => {
  const res = await fetch(`${API_BASE_URL}/listas/${listaId}/tarjetas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener tarjetas');
  return data;
};
// api/cards.ts
export const obtenerCardPorId = async (
  token: string,
  listaId: string,
  cardId: string
) => {
  const res = await fetch(`${API_BASE_URL}/listas/${listaId}/tarjetas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },  
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener tarjetas');
  // Busca la card por su ID y adapta el resultado
  const card = data.find((c: any) => c._id === cardId);
  // Si la encuentra, devuelve el objeto con .id además de ._id
  return card ? { ...card, id: card._id } : undefined;
};

export const crearCardEnLista = async (
  token: string,
  listaId: string,
  data: {
    titulo: string;
    descripcion: string;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/listas/${listaId}/tarjetas`, {
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
  const res = await fetch(`${API_BASE_URL}/tarjetas/${cardId}`, {
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

export const editarCard = async (
  token: string,
  cardId: string,
  data: {
    titulo: string;
    descripcion: string;
  }
) => {
  const res = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
    method: 'PUT', // o PATCH según tu backend, pero por convención usa PUT para editar
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al editar tarjeta');
  return result;
};

export const eliminarCard = async (
  token: string,
  cardId: string
) => {
  const res = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.msg || 'Error al eliminar tarjeta');
  return result;
};
