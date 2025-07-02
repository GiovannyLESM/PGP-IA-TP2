import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface Etiqueta {
  nombre: string;
  color: string;
}

interface ChecklistItem {
  nombre: string;
  completado: boolean;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  completada?: boolean;
  listaId: string;
  checklist?: ChecklistItem[];
  etiquetas?: Etiqueta[];
}

interface TareaCardProps {
  tarea: Tarea;
  index: number;
  onToggleCompletada: (tareaId: string, completada: boolean) => void;
  onAbrirTarea: (tarea: Tarea) => void;
  obtenerProgresoChecklist: (checklist?: ChecklistItem[]) => string | null;
}

export const TareaCard: React.FC<TareaCardProps> = ({
  tarea,
  index,
  onToggleCompletada,
  onAbrirTarea,
  obtenerProgresoChecklist,
}) => {
  const tieneEtiquetas = Array.isArray(tarea.etiquetas) && tarea.etiquetas.length > 0;
  const tieneChecklist = Array.isArray(tarea.checklist) && tarea.checklist.length > 0;

  return (
    <Draggable draggableId={tarea.id} index={index}>
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
          {tieneEtiquetas && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tarea.etiquetas!.map((etiqueta, idx) => (
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
              onChange={(e) => onToggleCompletada(tarea.id, e.target.checked)}
            />
            <div>
              <h3
                className="font-bold cursor-pointer hover:underline"
                onClick={() => onAbrirTarea(tarea)}
              >
                {tarea.titulo}
              </h3>
              {tieneChecklist && (
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  ✅ {obtenerProgresoChecklist(tarea.checklist!)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
