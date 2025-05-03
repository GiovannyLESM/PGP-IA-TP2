// src/modules/kanban/KanbanBoard.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';

interface Tarea {
  id: number;
  proyectoId: number;
  titulo: string;
  descripcion: string;
  estado: 'Pendiente' | 'En progreso' | 'Hecha';
  fecha: string;
}

export const KanbanBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [error, setError] = useState('');
  const estados: Tarea['estado'][] = ['Pendiente', 'En progreso', 'Hecha'];

  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    fecha: '',
  });

  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tareas');
    if (stored) {
      const todas: Tarea[] = JSON.parse(stored);
      const filtradas = todas.filter((t) => t.proyectoId === Number(id));
      setTareas(filtradas);
    }
  }, [id]);

  const guardarEnLocalStorage = (nuevas: Tarea[]) => {
    const allTareas: Tarea[] = JSON.parse(localStorage.getItem('tareas') || '[]');
    const otras = allTareas.filter((t) => t.proyectoId !== Number(id));
    const combinadas = [...otras, ...nuevas];
    localStorage.setItem('tareas', JSON.stringify(combinadas));
    setTareas(nuevas);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const tareaId = Number(draggableId);
    const nuevasTareas = tareas.map((t) =>
      t.id === tareaId ? { ...t, estado: destination.droppableId as Tarea['estado'] } : t
    );
    guardarEnLocalStorage(nuevasTareas);
  };

  const handleNuevaTarea = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaTarea.titulo || !nuevaTarea.descripcion || !nuevaTarea.estado || !nuevaTarea.fecha) {
      return setError('Todos los campos son obligatorios');
    }

    const nueva: Tarea = {
      id: Date.now(),
      proyectoId: Number(id),
      ...nuevaTarea,
      estado: nuevaTarea.estado as Tarea['estado'], // conversión segura
    };

    const actualizadas = [...tareas, nueva];
    guardarEnLocalStorage(actualizadas);
    setNuevaTarea({ titulo: '', descripcion: '', estado: 'Pendiente', fecha: '' });
    setError('');
  };

  const eliminarTarea = (idTarea: number) => {
    const actualizadas = tareas.filter((t) => t.id !== idTarea);
    guardarEnLocalStorage(actualizadas);
  };

  const abrirModalEdicion = (tarea: Tarea) => {
    setTareaEditando(tarea);
    setShowModal(true);
  };

  const guardarEdicion = () => {
    if (tareaEditando) {
      const nuevas = tareas.map((t) =>
        t.id === tareaEditando.id ? tareaEditando : t
      );
      guardarEnLocalStorage(nuevas);
      setShowModal(false);
    }
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {estados.map((estado) => (
            <Droppable key={estado} droppableId={estado}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded min-h-[300px]"
                >
                  <h2 className="text-xl font-semibold mb-3">{estado}</h2>

                  {tareas
                    .filter((t) => t.estado === estado)
                    .map((tarea, index) => (
                      <Draggable
                        key={tarea.id}
                        draggableId={tarea.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white border rounded p-3 mb-2 shadow"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-bold">{tarea.titulo}</h3>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => abrirModalEdicion(tarea)}
                                  className="text-yellow-500 text-sm"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => eliminarTarea(tarea.id)}
                                  className="text-red-500 text-sm"
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                            <p className="text-xs text-gray-400">{tarea.fecha}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Formulario de creación de tareas */}
      <div className="mt-8 max-w-xl mx-auto bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3 text-center">➕ Agregar Nueva Tarea</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleNuevaTarea} className="space-y-2">
          <input
            type="text"
            placeholder="Título"
            value={nuevaTarea.titulo}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevaTarea.descripcion}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <select
            value={nuevaTarea.estado}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, estado: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Hecha">Hecha</option>
          </select>
          <input
            type="date"
            value={nuevaTarea.fecha}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Guardar tarea
          </button>
        </form>
      </div>

      {/* Modal de edición */}
      {showModal && tareaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">✏️ Editar Tarea</h2>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={tareaEditando.titulo}
              onChange={(e) =>
                setTareaEditando({ ...tareaEditando, titulo: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={tareaEditando.descripcion}
              onChange={(e) =>
                setTareaEditando({ ...tareaEditando, descripcion: e.target.value })
              }
            />
            <select
              className="w-full p-2 border rounded mb-2"
              value={tareaEditando.estado}
              onChange={(e) =>
                setTareaEditando({
                  ...tareaEditando,
                  estado: e.target.value as Tarea['estado'],
                })
              }
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Hecha">Hecha</option>
            </select>
            <input
              type="date"
              className="w-full p-2 border rounded mb-4"
              value={tareaEditando.fecha}
              onChange={(e) =>
                setTareaEditando({ ...tareaEditando, fecha: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
