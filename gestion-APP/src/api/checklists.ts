export const agregarChecklistItem = async (
  token: string,
  cardId: string,
  item: { nombre: string; completado: boolean }
) => {
  const res = await fetch(`http://localhost:5000/api/cards/${cardId}/checklist`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al agregar ítem de checklist');
  return data;
};

export const actualizarChecklistItem = async (
  token: string,
  cardId: string,
  index: number,
  actualizado: { nombre: string; completado: boolean }
) => {
  const res = await fetch(`http://localhost:5000/api/cards/${cardId}/checklist/${index}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(actualizado),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al actualizar ítem');
  return data;
};




export const eliminarChecklistItem = async (
  token: string,
  cardId: string,
  index: number
) => {
  const res = await fetch(`http://localhost:5000/api/cards/${cardId}/checklist/${index}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al eliminar ítem del checklist');
  return data;
};


export const obtenerChecklist = async (token: string, cardId: string) => {
  const res = await fetch(`http://localhost:5000/api/cards/${cardId}/checklist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error al obtener checklist');
  return data;
};


