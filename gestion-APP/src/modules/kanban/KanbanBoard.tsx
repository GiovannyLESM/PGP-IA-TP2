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

  useEffect(() => {
    const stored = localStorage.getItem('tareas');
    if (stored) {
      const todas: Tarea[] = JSON.parse(stored);
      const filtradas = todas.filter((t) => t.proyectoId === Number(id));
      setTareas(filtradas);
    }
  }, [id]);

  const estados: Tarea['estado'][] = ['Pendiente', 'En progreso', 'Hecha'];

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const tareaId = Number(draggableId);
    const nuevasTareas = tareas.map((t) =>
      t.id === tareaId ? { ...t, estado: destination.droppableId as Tarea['estado'] } : t
    );

    setTareas(nuevasTareas);

    const allTareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    const actualizadas = allTareas.map((t: Tarea) =>
      t.id === tareaId ? { ...t, estado: destination.droppableId } : t
    );
    localStorage.setItem('tareas', JSON.stringify(actualizadas));
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <h3 className="font-bold">{tarea.titulo}</h3>
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
    </div>
  );
};
