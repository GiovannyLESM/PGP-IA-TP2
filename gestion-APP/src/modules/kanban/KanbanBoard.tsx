import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PlanificadorIA from "../../components/PlanificadorIA";
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useEditarCard, useEliminarCard } from '../../hooks/useCardMutations';
import { useEditarLista, useEliminarLista } from '../../hooks/useListMutations';
import {
  DragDropContext,
  DropResult,
} from '@hello-pangea/dnd';
import { useAuth } from '../../context/AuthContext';
import { obtenerListasPorProyecto, crearLista} from '../../api/lists';
import { obtenerCardsPorLista, crearCardEnLista, actualizarFechasCard, obtenerCardPorId} from '../../api/cards';
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
import { API_BASE_URL } from '../../api/config';
import { ModalDetalleTarea } from "./components/ModalDetalleTarea";
import { ListaKanban } from './components/ListaKanban';
import { FormularioNuevaLista } from './components/FormularioNuevaLista';
import { BotonPlanificadorIA } from './components/BotonPlanificadorIA';
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

  const { mutate: editarListaMutate } = useEditarLista();
  const { mutate: eliminarListaMutate } = useEliminarLista();
  const [editandoListaId, setEditandoListaId] = useState<string | null>(null);
  const [nuevoNombreLista, setNuevoNombreLista] = useState<string>('');

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
  
  const { mutate: editarCardMutate } = useEditarCard();
  const { mutate: eliminarCardMutate } = useEliminarCard();
  const [editandoCard, setEditandoCard] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [listaAEliminar, setListaAEliminar] = useState<string | null>(null);
  
  const [mostrarIA, setMostrarIA] = useState(false);
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

    await fetch(`${API_BASE_URL}/tarjetas/${tareaSeleccionada.id}/completada`, {
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
    await fetch(`${API_BASE_URL}/tarjetas/${tareaId}/completada`, {
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
    await fetch(`${API_BASE_URL}/tarjetas/${cardId}/mover`, {
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

const handlePlanificacionCompletada = () => {
  // Refresca las listas y las cards del proyecto
  queryClient.invalidateQueries({ queryKey: ['listas', id] });
  // Refresca todas las cards de todas las listas
  listas.forEach((lista: Lista) => {
    queryClient.invalidateQueries({ queryKey: ['cards', lista._id] });
  });
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
        {/* Chat IA arriba del tablero */}
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* SCROLL HORIZONTAL: flex-1 y overflow-x-auto en main, w-max aquí */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 w-max min-h-[350px]">
              {listas.map((lista:Lista) => {
                const tareasDeLista = tareas.filter((t) => t.listaId === lista._id);
                const mostrandoFormulario = !!mostrarFormulario[lista._id];
                const tareaData = nuevaTarea[lista._id] || { titulo: '', descripcion: '' };

                return (
                  <ListaKanban
                    key={lista._id}
                    lista={lista}
                    tareas={tareasDeLista}
                    editandoListaId={editandoListaId}
                    nuevoNombreLista={nuevoNombreLista}
                    mostrarFormulario={mostrandoFormulario}
                    nuevaTarea={tareaData}
                    onEditarNombre={setNuevoNombreLista}
                    onGuardarNombre={() => {
                      if (!token) return;
                      editarListaMutate({ token, listaId: lista._id, nombre: nuevoNombreLista });
                      setEditandoListaId(null);
                    }}
                    onIniciarEdicion={() => {
                      setEditandoListaId(lista._id);
                      setNuevoNombreLista(lista.nombre);
                    }}
                    onEliminarLista={() => setListaAEliminar(lista._id)}
                    onToggleCompletada={toggleCompletada}
                    onAbrirTarea={abrirDetalleTarea}
                    onMostrarFormulario={() =>
                      setMostrarFormulario((prev) => ({ ...prev, [lista._id]: true }))
                    }
                    onOcultarFormulario={() =>
                      setMostrarFormulario((prev) => ({ ...prev, [lista._id]: false }))
                    }
                    onActualizarNuevaTarea={(field, valor) =>
                      setNuevaTarea((prev) => ({
                        ...prev,
                        [lista._id]: { ...prev[lista._id], [field]: valor },
                      }))
                    }
                    onCrearTarea={(e) => handleCrearCard(e, lista._id)}
                    listaAEliminar={listaAEliminar === lista._id}
                    onConfirmarEliminar={() => {
                      if (!token || !listaAEliminar) return;
                      eliminarListaMutate({ token, listaId: listaAEliminar });
                      setListaAEliminar(null);
                    }}
                    onCancelarEliminar={() => setListaAEliminar(null)}
                    obtenerProgresoChecklist={obtenerProgresoChecklist}
                  />
                );
              })}

            </div>
          </div>
        </DragDropContext>

        {/* Formulario para nueva lista */}
        <FormularioNuevaLista
          nuevaLista={nuevaLista}
          onCambiarNombre={setNuevaLista}
          onCrearLista={async (e) => {
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
        />

         {/* Botón para abrir/cerrar IA */}
         <BotonPlanificadorIA
            mostrarIA={mostrarIA}
            onToggle={() => setMostrarIA(!mostrarIA)}
          />

          {/* Chat IA visible solo si mostrarIA es true */}
          {mostrarIA && (
            <div className="mt-6">
              <PlanificadorIA
                proyectoId={id!}
                token={token ?? undefined}
                onPlanificacionCompletada={handlePlanificacionCompletada}
              />
            </div>
          )}    
        {/* Modal de detalle de tarea */}
        {tareaSeleccionada && (
          <ModalDetalleTarea
            tarea={tareaSeleccionada}
            etiquetas={etiquetas}
            checklist={checklist}
            nuevoChecklist={nuevoChecklist}
            nuevoNombreChecklist={nuevoNombreChecklist}
            editandoCard={editandoCard}
            nuevoTitulo={nuevoTitulo}
            nuevaDescripcion={nuevaDescripcion}
            editandoIndex={editandoIndex}
            nuevaEtiqueta={nuevaEtiqueta}
            
            onClose={() => setTareaSeleccionada(null)}
            onEditar={() => {
              setEditandoCard(true);
              setNuevoTitulo(tareaSeleccionada.titulo);
              setNuevaDescripcion(tareaSeleccionada.descripcion);
            }}
            onGuardarEdicion={async () => {
              if (!token || !tareaSeleccionada) return;
              editarCardMutate({
                token,
                cardId: tareaSeleccionada.id,
                titulo: nuevoTitulo,
                descripcion: nuevaDescripcion,
              }, {
                onSuccess: async () => {
                  const actualizada = await obtenerCardPorId(token, tareaSeleccionada.listaId, tareaSeleccionada.id);
                  setTareaSeleccionada(actualizada);
                  setEditandoCard(false);
                }
              });
            }}
            onEliminar={() => {
              if (!token || !tareaSeleccionada) return;
              eliminarCardMutate({ token, cardId: tareaSeleccionada.id });
              setTareaSeleccionada(null);
            }}
            onActualizarTitulo={setNuevoTitulo}
            onActualizarDescripcion={setNuevaDescripcion}

            onAgregarEtiqueta={handleAgregarEtiqueta}
            onEliminarEtiqueta={handleEliminarEtiqueta}
            onActualizarEtiqueta={(field, value) =>
              setNuevaEtiqueta((prev) => ({ ...prev, [field]: value }))
            }

            onToggleChecklist={toggleChecklistItem}
            onAgregarChecklist={handleAgregarChecklist}
            onEliminarChecklist={eliminarItemChecklist}
            onEditarChecklist={(index, nombre) => {
              setEditandoIndex(index);
              setNuevoNombreChecklist(nombre);
            }}
            onGuardarChecklistNombre={guardarNombreChecklist}
            onActualizarChecklistNombre={setNuevoChecklist}

            onFechaInicioChange={async (fecha) => {
              if (!token || !tareaSeleccionada) return;
              const nuevaFechaFin = tareaSeleccionada.fechaFin || new Date(Date.now() + 86400000).toISOString();
              await actualizarFechasCard(token, tareaSeleccionada.id, {
                fechaInicio: fecha,
                fechaFin: nuevaFechaFin,
              });
              setTareaSeleccionada((prev) => prev ? { ...prev, fechaInicio: fecha } : prev);
              queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
            }}
            onFechaFinChange={async (fecha) => {
              if (!token || !tareaSeleccionada) return;
              const nuevaFechaInicio = tareaSeleccionada.fechaInicio || new Date().toISOString();
              await actualizarFechasCard(token, tareaSeleccionada.id, {
                fechaInicio: nuevaFechaInicio,
                fechaFin: fecha,
              });
              setTareaSeleccionada((prev) => prev ? { ...prev, fechaFin: fecha } : prev);
              queryClient.invalidateQueries({ queryKey: ['cards', tareaSeleccionada.listaId] });
            }}
          />
        )}
      </main>
    </div>
  </Layout>
);
}