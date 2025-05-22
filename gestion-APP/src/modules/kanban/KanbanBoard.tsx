import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useAuth } from '../../context/AuthContext';
import { obtenerListasPorProyecto, crearLista } from '../../api/lists';
import { obtenerCardsPorLista, crearCardEnLista } from '../../api/cards';

interface Lista {
  _id: string;
  nombre: string;
  posicion: number;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  listaId: string;
}

export const KanbanBoard = () => {
  const { id } = useParams(); // id del proyecto
  const navigate = useNavigate();
  const { token } = useAuth();

  const [listas, setListas] = useState<Lista[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [error, setError] = useState('');
  const [nuevaLista, setNuevaLista] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, { titulo: string; descripcion: string }>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState<Record<string, boolean>>({});

  const handleCrearCard = async (
  e: React.FormEvent,
  listaId: string
) => {
  e.preventDefault();

  const data = nuevaTarea[listaId];
  if (!data?.titulo || !data?.descripcion) return;

  try {
    await crearCardEnLista(token!, listaId, data);

    // Volver a cargar las tarjetas de TODAS las listas
    const todasLasCards: Tarea[] = [];

    for (const lista of listas) {
      const cards = await obtenerCardsPorLista(token!, lista._id);
      const adaptadas = cards.map((c: any) => ({
        id: c._id,
        titulo: c.titulo,
        descripcion: c.descripcion,
        listaId: lista._id,
      }));
      todasLasCards.push(...adaptadas);
    }

    setTareas(todasLasCards);

    // Limpiar inputs solo de esa lista
    setNuevaTarea((prev) => ({
      ...prev,
      [listaId]: { titulo: '', descripcion: '' },
    }));

    // Ocultar formulario
    setMostrarFormulario((prev) => ({ ...prev, [listaId]: false }));

  } catch (err: any) {
    alert(err.message || 'Error al crear tarea');
  }
};


  useEffect(() => {
    const cargarListas = async () => {
      try {
        const data = await obtenerListasPorProyecto(token!, id!);
        setListas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar listas');
      }
    };

    if (token && id) cargarListas();
  }, [token, id]);

  useEffect(() => {
    const cargarCardsPorListas = async () => {
      if (!token || listas.length === 0) return;

      try {
        const todasLasCards: Tarea[] = [];

        for (const lista of listas) {
          const cards = await obtenerCardsPorLista(token, lista._id);
          const adaptadas = cards.map((c: any) => ({
            id: c._id,
            titulo: c.titulo,
            descripcion: c.descripcion,
            listaId: lista._id,
          }));
          todasLasCards.push(...adaptadas);
        }

        setTareas(todasLasCards);
      } catch (err: any) {
        setError(err.message || 'Error al cargar tarjetas');
      }
    };

    cargarCardsPorListas();
  }, [token, listas]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const tareaId = draggableId;
    const actualizadas = tareas.map((t) =>
      t.id === tareaId ? { ...t, listaId: destination.droppableId } : t
    );
    setTareas(actualizadas);
    // Luego: PATCH al backend para persistir el cambio
  };

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver al proyecto
      </button>

      <h1 className="text-3xl font-bold mb-6">🗂️ Tablero Kanban</h1>

      {error && <p className="text-red-500">{error}</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {listas.map((lista) => (
            <Droppable droppableId={lista._id} key={lista._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded min-h-[300px]"
                >
                  <h2 className="text-xl font-semibold mb-3">{lista.nombre}</h2>

                  {tareas
                    .filter((t) => t.listaId === lista._id)
                    .map((tarea, index) => (
                      <Draggable
                        key={tarea.id}
                        draggableId={tarea.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border rounded p-3 mb-2 shadow"
                          >
                            <h3 className="font-bold">{tarea.titulo}</h3>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                  {/* Formulario de nueva tarea */}
                  {!mostrarFormulario[lista._id] ? (
                    <button
                      onClick={() =>
                        setMostrarFormulario((prev) => ({ ...prev, [lista._id]: true }))
                      }
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      ➕ Añadir tarea
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => handleCrearCard(e, lista._id)}
                      className="mt-3 space-y-2"
                    >
                      <input
                        type="text"
                        placeholder="Título de la tarea"
                        value={nuevaTarea[lista._id]?.titulo || ''}
                        onChange={(e) =>
                          setNuevaTarea((prev) => ({
                            ...prev,
                            [lista._id]: {
                              ...prev[lista._id],
                              titulo: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-1 border text-sm rounded"
                      />
                      <input
                        type="text"
                        placeholder="Descripción"
                        value={nuevaTarea[lista._id]?.descripcion || ''}
                        onChange={(e) =>
                          setNuevaTarea((prev) => ({
                            ...prev,
                            [lista._id]: {
                              ...prev[lista._id],
                              descripcion: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-1 border text-sm rounded"
                      />
                      <div className="flex justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setMostrarFormulario((prev) => ({ ...prev, [lista._id]: false }))
                          }
                          className="w-full px-2 py-1 text-sm border rounded hover:bg-gray-100"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-full bg-green-500 text-white px-2 py-1 text-sm rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Formulario para nueva lista */}
      <div className="mt-8 max-w-md mx-auto bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3 text-center">➕ Añadir nueva lista</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nuevaLista.trim()) return;

            try {
              const nueva = await crearLista(token!, id!, nuevaLista);
              setListas((prev) => [...prev, nueva]);
              setNuevaLista('');
            } catch (err: any) {
              alert(err.message || 'Error al crear la lista');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Nombre de la lista"
            value={nuevaLista}
            onChange={(e) => setNuevaLista(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
          >
            Crear
          </button>
        </form>
      </div>
    </div>
  );
};
