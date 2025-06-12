import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
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
import { Sidebar } from '../../components/Sidebar';
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
  completada?: boolean;
  listaId: string;
  fechaInicio?: string;
  fechaFin?: string;
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
}

export const KanbanBoard = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [error] = useState('');
  const [nuevaLista, setNuevaLista] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState<Record<string, { titulo: string; descripcion: string }>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState<Record<string, boolean>>({});
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [nuevoChecklist, setNuevoChecklist] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [etiquetas, setEtiquetas] = useState<{ nombre: string; color: string }[]>([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: '', color: '#000000' });
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [nuevoNombreChecklist, setNuevoNombreChecklist] = useState('');

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
    // await recargarTareas();
    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
  } catch (err) {
    alert('Error al agregar etiqueta');
  }
};


const handleEliminarEtiqueta = async (index: number) => {
  if (!tareaSeleccionada) return;
  try {
    await eliminarEtiqueta(token!, tareaSeleccionada.id, index);
    await cargarEtiquetas(tareaSeleccionada.id);

    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
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
const queryClient = useQueryClient();

const handleAgregarChecklist = async () => {
  if (!nuevoChecklist.trim() || !tareaSeleccionada) return;

  try {
    await agregarChecklistItem(token!, tareaSeleccionada.id, {
      nombre: nuevoChecklist,
      completado: false,
    });

    setNuevoChecklist('');
    const checklistActualizado = await obtenerChecklist(token!, tareaSeleccionada.id);
    setChecklist(checklistActualizado);

    // 🔁 Invalida la query de las cards de la lista correspondiente
    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
  } catch (error) {
    alert('Error al agregar ítem de checklist');
  }
};


const toggleChecklistItem = async (index: number, completado: boolean) => {
  if (!tareaSeleccionada) return;
  try {
    await actualizarChecklistItem(token!, tareaSeleccionada.id, index, {
      nombre: checklist[index].nombre,
      completado,
    });

    const nuevoChecklist = await obtenerChecklist(token!, tareaSeleccionada.id);
    setChecklist(nuevoChecklist);

    // Invalida la query de las cards de la lista correspondiente
    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });

    // Si todos los ítems están completados, marcar tarjeta como completada
    const todosCompletados = nuevoChecklist.every((item: ChecklistItem) => item.completado);

    await fetch(`http://localhost:5000/api/tarjetas/${tareaSeleccionada.id}/completada`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completada: todosCompletados }),
    });

    // Invalida la query de las cards de la lista nuevamente para reflejar el cambio de completada
    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });

  } catch (error) {
    alert('Error al actualizar ítem');
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

    // Busca la tarea para obtener el listaId
    const tarea = tareas.find((t) => t.id === tareaId);
    if (!tarea) return;

    // Invalida la query de las cards de la lista correspondiente
    queryClient.invalidateQueries({ queryKey: ['cards', tarea.listaId] });
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

    queryClient.invalidateQueries({ queryKey: ['cards', listaId] });

    setNuevaTarea((prev) => ({ ...prev, [listaId]: { titulo: '', descripcion: '' } }));
    setMostrarFormulario((prev) => ({ ...prev, [listaId]: false }));
  } catch (err: any) {
    alert(err.message || 'Error al crear tarea');
  }
};


// Query para cargar listas
const { data: listas = []} = useQuery({
  queryKey: ['listas', id],
  queryFn: () => obtenerListasPorProyecto(token!, id!),
  enabled: !!token && !!id,
});

const tareasQueries = useQueries({
  queries: listas.map((lista: Lista) => ({
    queryKey: ['cards', lista._id],
    queryFn: () => obtenerCardsPorLista(token!, lista._id),
    enabled: !!token && !!lista._id,
  })),
});

const tareas: Tarea[] = tareasQueries.flatMap((q, idx) =>
  (q.data as any[] || []).map((c: any) => ({
    id: c._id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    completada: c.completada,
    listaId: listas[idx]?._id || '',
    fechaInicio: c.fechaInicio,
    fechaFin: c.fechaFin,
    checklist: c.checklist || [],
    etiquetas: c.etiquetas || [],
  }))
);


const handleDragEnd = async (result: DropResult) => {
  const { destination, source, draggableId } = result;

  if (!destination) return;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return;

  const tareaId = draggableId;

  // Mueve la card en el backend
  await moverCard(tareaId, destination.droppableId);

  // Invalida las queries de las cards de ambas listas (origen y destino)
  queryClient.invalidateQueries({ queryKey: ['cards', source.droppableId] });
  queryClient.invalidateQueries({ queryKey: ['cards', destination.droppableId] });
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
const guardarNombreChecklist = async (index: number) => {
  if (!tareaSeleccionada || !nuevoNombreChecklist.trim()) return;

  try {
    await actualizarChecklistItem(token!, tareaSeleccionada.id, index, {
      nombre: nuevoNombreChecklist,
      completado: checklist[index].completado,
    });

    const actualizado = await obtenerChecklist(token!, tareaSeleccionada.id);
    setChecklist(actualizado);

    // Invalida la query para que React Query recargue las tareas de la lista correspondiente
    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });

    setEditandoIndex(null);
    setNuevoNombreChecklist('');
  } catch (err) {
    alert('Error al actualizar nombre del ítem');
  }
};

return (
  <Layout>
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Sidebar />
      {/* ÁREA PRINCIPAL: flex-1, overflow-x-auto */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-x-auto">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Volver al proyecto
        </button>

        <h1 className="text-3xl font-bold mb-6">🗂️ Tablero Kanban</h1>
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* SCROLL HORIZONTAL: flex-1 y overflow-x-auto en main, w-max aquí */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 w-max min-h-[350px]">
              {listas.map((lista: Lista) => (
                <Droppable droppableId={lista._id} key={lista._id}>
                  {(provided) => (
                    <div
                      data-testid="lista-kanban"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-100 dark:bg-gray-800 p-4 rounded min-w-[320px] max-w-xs transition-colors flex-shrink-0 shadow-lg"
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
                                className={`border rounded p-3 mb-2 shadow bg-white dark:bg-gray-700 dark:text-white transition-colors cursor-pointer hover:shadow-2xl ${
                                  tarea.completada
                                    ? 'bg-green-50 dark:bg-green-900 line-through text-green-700 dark:text-green-300'
                                    : ''
                                }`}
                              >
                                {tarea.etiquetas && tarea.etiquetas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {tarea.etiquetas.map((etiqueta, idx) => (
                                      <span
                                        key={idx}
                                        data-testid="etiqueta-creada"
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
                            name='tarea'
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
                            name='descripcion'
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
                setNuevaLista('');
                queryClient.invalidateQueries({ queryKey: ['listas', id] });

                if (nueva && nueva._id) {
                  queryClient.invalidateQueries({ queryKey: ['cards', nueva._id] });
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

        {/* Modal de detalle de tarea */}
        {tareaSeleccionada && (
          <div data-testid="modal-tarea" className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow max-w-md w-full transition-colors duration-300">
              <h2 className="text-2xl font-bold mb-4">📋 Detalles de la Tarjeta</h2>
              <p className="font-semibold mb-1">Título:</p>
              <p className="mb-2">{tareaSeleccionada.titulo}</p>
              <p className="font-semibold mb-1">Descripción:</p>
              <p className="mb-2">{tareaSeleccionada.descripcion}</p>
              {(tareaSeleccionada.fechaInicio || tareaSeleccionada.fechaFin) && (
                <>
                  <p className="font-semibold mb-1">Fechas:</p>
                  {tareaSeleccionada.fechaInicio && (
                    <p className="mb-1">Inicio: {tareaSeleccionada.fechaInicio}</p>
                  )}
                  {tareaSeleccionada.fechaFin && (
                    <p className="mb-2">Fin: {tareaSeleccionada.fechaFin}</p>
                  )}
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
                    data-testid="input-etiqueta"
                    type="text"
                    placeholder="Nombre"
                    value={nuevaEtiqueta.nombre}
                    onChange={(e) => setNuevaEtiqueta((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    data-testid="color-etiqueta"
                    type="color"
                    value={nuevaEtiqueta.color}
                    onChange={(e) => setNuevaEtiqueta((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 border p-0"
                  />
                  <button
                    data-testid="btn-agregar-etiqueta"
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
                          {editandoIndex === index ? (
                            <input
                              type="text"
                              value={nuevoNombreChecklist}
                              onChange={(e) => setNuevoNombreChecklist(e.target.value)}
                              onBlur={() => guardarNombreChecklist(index)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') guardarNombreChecklist(index);
                              }}
                              autoFocus
                              className="border p-0.5 text-sm rounded"
                            />
                          ) : (
                            <span
                              className={`${item.completado ? 'line-through text-green-600' : ''} cursor-pointer`}
                              onDoubleClick={() => {
                                setEditandoIndex(index);
                                setNuevoNombreChecklist(item.nombre);
                              }}
                            >
                              {item.nombre}
                            </span>
                          )}
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
                    data-testid="input-checklist"
                    placeholder="Nombre del ítem"
                    value={nuevoChecklist}
                    onChange={(e) => setNuevoChecklist(e.target.value)}
                    className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    data-testid="btn-agregar-checklist"
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
                  name="fechaInicio"
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

                    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
                  }}
                  className="p-1 border rounded text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <label className="block text-sm font-medium">📅 Fecha de fin:</label>
                <input
                  name="fechaFin"
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
                    queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
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
      </main>
    </div>
  </Layout>
);
}