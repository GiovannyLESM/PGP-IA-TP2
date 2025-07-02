import React from "react";

interface ChecklistItem {
  nombre: string;
  completado: boolean;
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

interface ModalDetalleTareaProps {
  tarea: Tarea;
  etiquetas: Etiqueta[];
  checklist: ChecklistItem[];
  nuevoChecklist: string;
  nuevoNombreChecklist: string;
  editandoCard: boolean;
  nuevoTitulo: string;
  nuevaDescripcion: string;
  editandoIndex: number | null;
  nuevaEtiqueta: Etiqueta;

  onClose: () => void;
  onEditar: () => void;
  onGuardarEdicion: () => void;
  onEliminar: () => void;
  onActualizarTitulo: (value: string) => void;
  onActualizarDescripcion: (value: string) => void;
  onAgregarEtiqueta: () => void;
  onEliminarEtiqueta: (index: number) => void;
  onActualizarEtiqueta: (field: "nombre" | "color", value: string) => void;

  onToggleChecklist: (index: number, completado: boolean) => void;
  onAgregarChecklist: () => void;
  onEliminarChecklist: (index: number) => void;
  onEditarChecklist: (index: number, nombre: string) => void;
  onGuardarChecklistNombre: (index: number) => void;
  onActualizarChecklistNombre: (nombre: string) => void;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
}

export const ModalDetalleTarea: React.FC<ModalDetalleTareaProps> = ({
  tarea,
  etiquetas,
  checklist,
  nuevoChecklist,
  nuevoNombreChecklist,
  editandoCard,
  nuevoTitulo,
  nuevaDescripcion,
  editandoIndex,
  nuevaEtiqueta,
  onClose,
  onEditar,
  onGuardarEdicion,
  onEliminar,
  onActualizarTitulo,
  onActualizarDescripcion,
  onAgregarEtiqueta,
  onEliminarEtiqueta,
  onActualizarEtiqueta,
  onToggleChecklist,
  onAgregarChecklist,
  onEliminarChecklist,
  onEditarChecklist,
  onGuardarChecklistNombre,
  onFechaInicioChange,
  onFechaFinChange,
  onActualizarChecklistNombre,
}) => {
  return (
    <div data-testid="modal-tarea" className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow max-w-md w-full transition-colors duration-300 max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4">📋 Detalles de la Tarjeta</h2>

        {editandoCard ? (
          <>
            <input
              value={nuevoTitulo}
              onChange={e => onActualizarTitulo(e.target.value)}
              className="mb-2 border rounded px-2 py-1 w-full"
            />
            <textarea
              value={nuevaDescripcion}
              onChange={e => onActualizarDescripcion(e.target.value)}
              className="mb-2 border rounded px-2 py-1 w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={onGuardarEdicion}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold mb-1">Título:</p>
            <p className="mb-2">{tarea.titulo}</p>
            <p className="font-semibold mb-1">Descripción:</p>
            <p className="mb-2">{tarea.descripcion}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={onEditar}
                className="text-blue-500 hover:text-blue-700"
              >
                ✏️ Editar
              </button>
              <button
                onClick={onEliminar}
                className="text-red-500 hover:text-red-700"
              >
                🗑️ Eliminar
              </button>
            </div>
          </>
        )}

        {/* Etiquetas */}
        {etiquetas.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-1">Etiquetas:</p>
            <div className="flex flex-wrap gap-2">
              {etiquetas.map((etiqueta, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="px-2 py-1 text-xs rounded font-medium text-white" style={{ backgroundColor: etiqueta.color }}>
                    {etiqueta.nombre}
                  </span>
                  <button onClick={() => onEliminarEtiqueta(idx)} className="text-xs text-red-500 hover:text-red-700">
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nueva etiqueta */}
        <div className="mt-4">
          <h4 className="font-semibold mb-1">🎨 Nueva etiqueta</h4>
          <div className="flex gap-2 items-center">
            <input
              data-testid="input-etiqueta"
              type="text"
              placeholder="Nombre"
              value={nuevaEtiqueta.nombre}
              onChange={(e) => onActualizarEtiqueta("nombre", e.target.value)}
              className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              data-testid="color-etiqueta"
              type="color"
              value={nuevaEtiqueta.color}
              onChange={(e) => onActualizarEtiqueta("color", e.target.value)}
              className="w-10 h-10 border p-0"
            />
            <button
              data-testid="btn-agregar-etiqueta"
              onClick={onAgregarEtiqueta}
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
                      onChange={(e) => onToggleChecklist(index, e.target.checked)}
                    />
                    {editandoIndex === index ? (
                      <input
                        type="text"
                        value={nuevoNombreChecklist}
                        onChange={(e) => onEditarChecklist(index, e.target.value)}
                        onBlur={() => onGuardarChecklistNombre(index)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onGuardarChecklistNombre(index);
                        }}
                        autoFocus
                        className="border p-0.5 text-sm rounded"
                      />
                    ) : (
                      <span
                        className={`${item.completado ? 'line-through text-green-600' : ''} cursor-pointer`}
                        onDoubleClick={() => onEditarChecklist(index, item.nombre)}
                      >
                        {item.nombre}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onEliminarChecklist(index)}
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
              onChange={(e) => onActualizarChecklistNombre(e.target.value)}
              className="flex-1 p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              data-testid="btn-agregar-checklist"
              onClick={onAgregarChecklist}
              className="bg-green-600 text-white px-2 rounded hover:bg-green-700 text-sm"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Fechas */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium">📅 Fecha de inicio:</label>
          <input
            name="fechaInicio"
            type="date"
            value={tarea.fechaInicio?.slice(0, 10) || ''}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            className="p-1 border rounded text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <label className="block text-sm font-medium">📅 Fecha de fin:</label>
          <input
            name="fechaFin"
            type="date"
            value={tarea.fechaFin?.slice(0, 10) || ''}
            onChange={(e) => onFechaFinChange(e.target.value)}
            className="p-1 border rounded text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};