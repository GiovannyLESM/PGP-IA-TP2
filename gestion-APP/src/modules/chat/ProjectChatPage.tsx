import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

interface Mensaje {
  id: number;
  proyectoId: number;
  autor: string;
  contenido: string;
  fecha: string;
}

export const ProjectChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [nombreProyecto, setNombreProyecto] = useState('');

  // Cargar nombre del proyecto
  useEffect(() => {
    const storedProyectos = localStorage.getItem('proyectos');
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      const encontrado = proyectos.find((p: any) => p.id === Number(id));
      if (encontrado) setNombreProyecto(encontrado.nombre);
    }
  }, [id]);

  // Cargar mensajes
  useEffect(() => {
    const storedMensajes = localStorage.getItem('mensajes') || '[]';
    const todos = JSON.parse(storedMensajes);
    const filtrados = todos.filter((m: Mensaje) => m.proyectoId === Number(id));
    setMensajes(filtrados);
  }, [id]);

  // Scroll al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = () => {
    const contenidoLimpio = nuevoMensaje.trim();
    if (!contenidoLimpio) return;

    const nuevo: Mensaje = {
      id: Date.now(),
      proyectoId: Number(id),
      autor: 'Tú',
      contenido: contenidoLimpio,
      fecha: new Date().toLocaleString(),
    };

    const actualizados = [...mensajes, nuevo];
    setMensajes(actualizados);
    localStorage.setItem('mensajes', JSON.stringify([...JSON.parse(localStorage.getItem('mensajes') || '[]'), nuevo]));
    setNuevoMensaje('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver
      </button>

      <h1 className="text-3xl font-bold mb-4">💬 Chat del proyecto: {nombreProyecto}</h1>

      <div className="border rounded p-4 mb-4 h-[450px] overflow-y-auto bg-white shadow-inner space-y-4">
        {mensajes.length === 0 ? (
          <p className="text-gray-500 italic">Aún no hay mensajes.</p>
        ) : (
          mensajes.map((msg) => (
            <div key={msg.id} className="bg-gray-100 rounded p-3 shadow-sm">
              <div className="flex justify-between text-sm mb-1 text-gray-700 font-semibold">
                <span>{msg.autor}</span>
                <span className="text-xs text-gray-500">{msg.fecha}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-line">{msg.contenido}</p>
            </div>
          ))
        )}
        <div ref={chatEndRef}></div>
      </div>

      <div className="bg-white border rounded shadow p-3 flex items-end gap-2">
      <textarea
        ref={(el) => {
            if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
            }
        }}
        value={nuevoMensaje}
        onChange={(e) => {
            setNuevoMensaje(e.target.value);
            const el = e.target;
            el.style.height = 'auto'; // Reset height
            el.style.height = el.scrollHeight + 'px'; // Ajusta al contenido
        }}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu mensaje..."
        className="w-full p-2 resize-none border rounded focus:outline-none overflow-hidden transition-all"
        rows={1}
    />

        <button
            onClick={handleEnviar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Enviar
        </button>
        </div>
    </div>
  );
};
