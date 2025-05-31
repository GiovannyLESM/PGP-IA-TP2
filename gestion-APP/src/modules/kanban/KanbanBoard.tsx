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
import { obtenerCardsPorLista, crearCardEnLista, actualizarFechasCard } from '../../api/cards';
import {
  agregarChecklistItem,
  actualizarChecklistItem,
  eliminarChecklistItem,
  obtenerChecklist,
} from '../../api/checklists';
import {
  obtenerEtiquetas,
  agregarEtiqueta,
  eliminarEtiqueta,
} from '../../api/etiquetas';
import { Layout } from '../../components/Layout';
interface ChecklistItem {
  nombre: string;
  completado: boolean;
}

interface Lista {
  _id: string;
  nombre: string;
  posicion: number;
}
interface Etiqueta {
  nombre: string;
  color: string;
}
interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  listaId: string;
  completada?: boolean;
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
  
}

export const KanbanBoard = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [listas, setListas] = useState<Lista[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [error, setError] = useState('');
  const [nuevaLista, setNuevaLista] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, { titulo: string; descripcion: string }>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState<Record<string, boolean>>({});
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [nuevoChecklist, setNuevoChecklist] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [etiquetas, setEtiquetas] = useState<{ nombre: string; color: string }[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: '', color: '#000000' });

  const obtenerProgresoChecklist = (checklist?: ChecklistItem[]) => {
  if (!checklist || checklist.length === 0) return null;

  const completados = checklist.filter((item) => item.completado).length;
  const total = checklist.length;
  return `${completados}/${total}`;
};

const cargarEtiquetas = async (cardId: string) => {
  try {
    const data = await obtenerEtiquetas(token!, cardId);
    setEtiquetas(data);
  } catch (err) {
    console.error('Error al obtener etiquetas', err);
  }
};

const handleAgregarEtiqueta = async () => {
  if (!nuevaEtiqueta.nombre.trim() || !tareaSeleccionada) return;
  try {
    await agregarEtiqueta(token!, tareaSeleccionada.id, nuevaEtiqueta);
    setNuevaEtiqueta({ nombre: '', color: '#000000' });
    await cargarEtiquetas(tareaSeleccionada.id);
    await recargarTareas();
  } catch (err) {
    alert('Error al agregar etiqueta');
  }
};

const handleEliminarEtiqueta = async (index: number) => {
  if (!tareaSeleccionada) return;
  try {
    await eliminarEtiqueta(token!, tareaSeleccionada.id, index);
    await cargarEtiquetas(tareaSeleccionada.id);
    await recargarTareas();
  } catch (err) {
    alert('Error al eliminar etiqueta');
  }
};

const cargarChecklist = async (cardId: string) => {
  try {
    const data = await obtenerChecklist(token!, cardId);
    setChecklist(data);
  } catch (error) {
    console.error('Error al cargar checklist:', error);
  }
};  
const handleAgregarChecklist = async () => {
  if (!nuevoChecklist.trim() || !tareaSeleccionada) return;

  try {
    await agregarChecklistItem(token!, tareaSeleccionada.id, {
      nombre: nuevoChecklist,
      completado: false,
    });

    setNuevoChecklist('');
    await cargarChecklist(tareaSeleccionada.id); // 🔁 recarga el checklist visible
  } catch (error) {
    alert('Error al agregar ítem de checklist');
  }
};
const toggleChecklistItem = async (index: number, completado: boolean) => {
  if (!tareaSeleccionada) return;

  try {
    await actualizarChecklistItem(token!, tareaSeleccionada.id, index, completado);

    const nuevoChecklist = await obtenerChecklist(token!, tareaSeleccionada.id);
    setChecklist(nuevoChecklist);

    // 🔁 actualiza también en la lista general de tareas
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaSeleccionada.id
          ? { ...t, checklist: nuevoChecklist }
          : t
      )
    );

    //Si todos los ítems están completados, marcar tarjeta como completada
  const todosCompletados = nuevoChecklist.every((item) => item.completado);

    if (todosCompletados) {
      await fetch(`http://localhost:5000/api/tarjetas/${tareaSeleccionada.id}/completada`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completada: true }),
      });

      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaSeleccionada.id
            ? { ...t, completada: true }
            : t
        )
      );
    } else {
      // Si desmarcan al menos uno, desmarcar la tarjeta como incompleta
      await fetch(`http://localhost:5000/api/tarjetas/${tareaSeleccionada.id}/completada`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completada: false }),
      });

      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaSeleccionada.id
            ? { ...t, completada: false }
            : t
        )
      );
    }

  } catch (error) {
    alert('Error al actualizar ítem');
  }
};

const recargarTareas = async () => {
  if (!token || listas.length === 0) return;

  try {
    const todasLasCards: Tarea[] = [];

    for (const lista of listas) {
      const cards = await obtenerCardsPorLista(token, lista._id);
      const adaptadas = cards.map((c: any) => ({
        id: c._id,
        titulo: c.titulo,
        descripcion: c.descripcion,
        completada: c.completada,
        listaId: lista._id,
        fechaInicio: c.fechaInicio,
        fechaFin: c.fechaFin,
        checklist: c.checklist || [],
        etiquetas: c.etiquetas || [],
      }));
      todasLasCards.push(...adaptadas);
    }

    setTareas(todasLasCards);
  } catch (err) {
    setError('Error al recargar tareas');
  }
};

const abrirDetalleTarea = async (tarea: Tarea) => {
  setTareaSeleccionada(tarea);
  cargarChecklist(tarea.id);
  cargarEtiquetas(tarea.id);
  
};


  const toggleCompletada = async (tareaId: string, completada: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/tarjetas/${tareaId}/completada`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completada }),
      });

      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaId ? { ...t, completada } : t
        )
      );
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleCrearCard = async (e: React.FormEvent, listaId: string) => {
    e.preventDefault();
    const data = nuevaTarea[listaId];
    if (!data?.titulo || !data?.descripcion) return;

    try {
      await crearCardEnLista(token!, listaId, data);

      const todasLasCards: Tarea[] = [];
      for (const lista of listas) {
        const cards = await obtenerCardsPorLista(token!, lista._id);
        const adaptadas = cards.map((c: any) => ({
          id: c._id,
          titulo: c.titulo,
          descripcion: c.descripcion,
          completada: c.completada,
          listaId: lista._id,
          fechaInicio: c.fechaInicio,
          fechaFin: c.fechaFin,
          checklist: c.checklist || [],
          etiquetas: c.etiquetas || [],
        }));
        todasLasCards.push(...adaptadas);
      }

      setTareas(todasLasCards);
      setNuevaTarea((prev) => ({ ...prev, [listaId]: { titulo: '', descripcion: '' } }));
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
            completada: c.completada,
            listaId: lista._id,
            fechaInicio: c.fechaInicio,
            fechaFin: c.fechaFin,
            checklist: c.checklist || [],
            etiquetas: c.etiquetas || [],
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const tareaId = draggableId;

    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId ? { ...t, listaId: destination.droppableId } : t
      )
    );

    await moverCard(tareaId, destination.droppableId);
  };

  const eliminarItemChecklist = async (index: number) => {
  if (!tareaSeleccionada) return;
  try {
    await eliminarChecklistItem(token!, tareaSeleccionada.id, index);
    await cargarChecklist(tareaSeleccionada.id); // recarga el checklist actualizado
  } catch (error) {
    alert('Error al eliminar ítem');
  }
};


  const moverCard = async (cardId: string, nuevaListaId: string) => {
  try {
    await fetch(`http://localhost:5000/api/tarjetas/${cardId}/mover`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nuevaListaId }),
    });
  } catch (error) {
    console.error('Error al mover la tarjeta:', error);
  }
};

return (
  <Layout>
    <div className="p-8 text-black dark:text-white">
      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Volver al proyecto
      </button>

      <h1 className="text-3xl font-bold mb-6">🗂️ Tablero Kanban</h1>

      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {listas.map((lista) => (
            <Droppable droppableId={lista._id} key={lista._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded min-h-[300px] transition-colors"
                >
                  <h2 className="text-xl font-semibold mb-3">{lista.nombre}</h2>

                  {tareas
                    .filter((t) => t.listaId === lista._id)
                    .map((tarea, index) => (
                      <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`border rounded p-3 mb-2 shadow bg-white dark:bg-gray-700 dark:text-white transition-colors ${
                              tarea.completada ? 'bg-green-50 dark:bg-green-900 line-through text-green-700 dark:text-green-300' : ''
                            }`}
                          >
                            {tarea.etiquetas && tarea.etiquetas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {tarea.etiquetas.map((etiqueta, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs rounded font-medium text-white"
                                    style={{ backgroundColor: etiqueta.color }}
                                  >
                                    {etiqueta.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={tarea.completada || false}
                                onChange={(e) => toggleCompletada(tarea.id, e.target.checked)}
                              />
                              <div>
                                <h3
                                  className="font-bold cursor-pointer hover:underline"
                                  onClick={() => abrirDetalleTarea(tarea)}
                                >
                                  {tarea.titulo}
                                </h3>
                                {tarea.checklist && tarea.checklist.length > 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                    ✅ {obtenerProgresoChecklist(tarea.checklist)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}

                  {!mostrarFormulario[lista._id] ? (
                    <button
                      onClick={() =>
                        setMostrarFormulario((prev) => ({ ...prev, [lista._id]: true }))
                      }
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
                        className="w-full p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                        className="w-full p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div className="flex justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setMostrarFormulario((prev) => ({
                              ...prev,
                              [lista._id]: false,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-600"
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
      <div className="mt-8 max-w-md mx-auto bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3 text-center">➕ Añadir nueva lista</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!nuevaLista.trim()) return;

            try {
              const response = await crearLista(token!, id!, nuevaLista);
              const nueva = response.lista;
              console.log('Lista creada:', nueva);
              setListas((prev) => [...prev, nueva]);
              setNuevaLista('');

              if (nueva && nueva._id) {
                const tarjetas = await obtenerCardsPorLista(token!, nueva._id);
                const tarjetasAdaptadas = tarjetas.map((c: any) => ({
                  id: c._id,
                  titulo: c.titulo,
                  descripcion: c.descripcion,
                  completada: c.completada,
                  listaId: nueva._id,
                  fechaInicio: c.fechaInicio,
                  fechaFin: c.fechaFin,
                  checklist: c.checklist || [],
                  etiquetas: c.etiquetas || [],
                }));

                setTareas((prev) => [...prev, ...tarjetasAdaptadas]);
              }
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
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
          >
            Crear
          </button>
        </form>
      </div>

    {/* Modal de detalle de tarjeta */}

    {tareaSeleccionada && (
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow max-w-md w-full transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4">📋 Detalles de la Tarjeta</h2>

          {/* Título y descripción */}
          <p className="font-semibold mb-1">Título:</p>
          <p className="mb-2">{tareaSeleccionada.titulo}</p>

          <p className="font-semibold mb-1">Descripción:</p>
          <p className="mb-2">{tareaSeleccionada.descripcion}</p>

          {tareaSeleccionada.fecha && (
            <>
              <p className="font-semibold mb-1">Fecha:</p>
              <p className="mb-2">{tareaSeleccionada.fecha}</p>
            </>
          )}

          {/* Etiquetas */}
          {etiquetas.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold mb-1">Etiquetas:</p>
              <div className="flex flex-wrap gap-2">
                {etiquetas.map((etiqueta, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="px-2 py-1 text-xs rounded font-medium text-white"
                      style={{ backgroundColor: etiqueta.color }}
                    >
                      {etiqueta.nombre}
                    </span>
                    <button
                      onClick={() => handleEliminarEtiqueta(idx)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-semibold mb-1">🎨 Nueva etiqueta</h4>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nombre"
                value={nuevaEtiqueta.nombre}
                onChange={(e) => setNuevaEtiqueta((prev) => ({ ...prev, nombre: e.target.value }))}
                className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="color"
                value={nuevaEtiqueta.color}
                onChange={(e) => setNuevaEtiqueta((prev) => ({ ...prev, color: e.target.value }))}
                className="w-10 h-10 border p-0"
              />
              <button
                onClick={handleAgregarEtiqueta}
                className="bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700 text-sm"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">✅ Checklist:</h3>
              <ul className="space-y-2">
                {checklist.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completado}
                        onChange={(e) => toggleChecklistItem(index, e.target.checked)}
                      />
                      <span className={`${item.completado ? 'line-through text-green-600' : ''}`}>
                        {item.nombre}
                      </span>
                    </div>
                    <button
                      onClick={() => eliminarItemChecklist(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Añadir nuevo ítem al checklist */}
          <div className="mt-4">
            <h4 className="font-semibold mb-1">➕ Añadir checklist</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del ítem"
                value={nuevoChecklist}
                onChange={(e) => setNuevoChecklist(e.target.value)}
                className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleAgregarChecklist}
                className="bg-green-600 text-white px-2 rounded hover:bg-green-700 text-sm"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium">📅 Fecha de inicio:</label>
            <input
              type="date"
              value={tareaSeleccionada.fechaInicio?.slice(0, 10) || ''}
              onChange={async (e) => {
                const nuevaFechaInicio = e.target.value;
                const nuevaFechaFin = tareaSeleccionada.fechaFin || new Date(Date.now() + 86400000).toISOString();

                await actualizarFechasCard(token!, tareaSeleccionada.id, {
                  fechaInicio: nuevaFechaInicio,
                  fechaFin: nuevaFechaFin,
                });

                setTareaSeleccionada((prev) =>
                  prev ? { ...prev, fechaInicio: nuevaFechaInicio } : prev
                );

                await recargarTareas();
              }}
              className="p-1 border rounded text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            <label className="block text-sm font-medium">📅 Fecha de fin:</label>
            <input
              type="date"
              value={tareaSeleccionada.fechaFin?.slice(0, 10) || ''}
              onChange={async (e) => {
                const nuevaFechaFin = e.target.value;
                const nuevaFechaInicio = tareaSeleccionada.fechaInicio || new Date().toISOString();

                await actualizarFechasCard(token!, tareaSeleccionada.id, {
                  fechaInicio: nuevaFechaInicio,
                  fechaFin: nuevaFechaFin,
                });

                setTareaSeleccionada((prev) =>
                  prev ? { ...prev, fechaFin: nuevaFechaFin } : prev
                );

                await recargarTareas();
              }}
              className="p-1 border rounded text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setTareaSeleccionada(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  </Layout>
);
}
