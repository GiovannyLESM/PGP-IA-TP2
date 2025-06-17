import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';
const SOCKET_URL = 'http://localhost:5000';
import { API_BASE_URL } from '../../api/config';

interface Usuario {
  _id: string;
  nombre: string;
  correo: string;
  avatar?: string;
}
interface Mensaje {
  _id: string;
  contenido: string;
  createdAt: string;
  usuario: Usuario;
}

export const ProjectChatPage = () => {
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [miembros, setMiembros] = useState<Usuario[]>([]);
  const [conectados, setConectados] = useState<string[]>([]);
  const { id: proyectoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, token } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  //Estados para "escribiendo" ---
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<string[]>([]);
  const escribiendoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [escribiendo, setEscribiendo] = useState(false);

  // Cargar datos del proyecto y miembros
  useEffect(() => {
    const fetchProyecto = async () => {
      const res = await fetch(`${API_BASE_URL}/projects/${proyectoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNombreProyecto(data.nombre);
      setMiembros(data.miembros.map((m: any) => m.usuario));
    };
    if (proyectoId && token) fetchProyecto();
  }, [proyectoId, token]);

  // Cargar mensajes históricos
  useEffect(() => {
    const fetchMensajes = async () => {
      const res = await fetch(`${API_BASE_URL}/messages/${proyectoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMensajes(data);
    };
    if (proyectoId && token) fetchMensajes();
  }, [proyectoId, token]);

  // Conexión y eventos de socket (solo una vez)
  useEffect(() => {
    if (!proyectoId || !usuario) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('joinRoom', { proyectoId, userId: usuario._id });

    socket.on('chat:nuevoMensaje', (mensaje: Mensaje) => {
      setMensajes(prev => [...prev, mensaje]);
    });

    socket.on('usuarios:conectados', (listaIds: string[]) => {
      setConectados(listaIds);
    });

    // --- NUEVO: Escuchar eventos de "escribiendo" ---
    socket.on('usuario:escribiendo', ({ userId }) => {
      setUsuariosEscribiendo(prev => {
        if (!prev.includes(userId) && userId !== usuario!._id) return [...prev, userId];
        return prev;
      });
    });
    socket.on('usuario:dejoDeEscribir', ({ userId }) => {
      setUsuariosEscribiendo(prev => prev.filter(id => id !== userId));
    });

    return () => {
      socket.disconnect();
    };
  }, [proyectoId, usuario]);

  // Scroll automático al final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // --- NUEVO: Emitir eventos de "escribiendo" ---
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNuevoMensaje(e.target.value);

    if (!socketRef.current || !proyectoId || !usuario) return;

    if (!escribiendo) {
      setEscribiendo(true);
      socketRef.current.emit('typing', { proyectoId, userId: usuario._id });
    }

    if (escribiendoTimeoutRef.current) clearTimeout(escribiendoTimeoutRef.current);

    escribiendoTimeoutRef.current = setTimeout(() => {
      setEscribiendo(false);
      socketRef.current?.emit('stopTyping', { proyectoId, userId: usuario._id });
    }, 1000);
  };

  // Enviar mensaje usando el socket ya conectado
  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const contenidoLimpio = nuevoMensaje.trim();
    if (!contenidoLimpio || !usuario) return;

    socketRef.current?.emit('chat:mensaje', {
      proyectoId,
      contenido: contenidoLimpio,
      usuarioId: usuario._id,
    });
    setNuevoMensaje('');
    setEscribiendo(false);
    socketRef.current?.emit('stopTyping', { proyectoId, userId: usuario._id });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };
console.log(miembros);
  return (
    <Layout>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto min-h-[80vh]">
          {/* Barra lateral de miembros */} 
          <aside className="hidden md:block md:w-64 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700 p-4">
            <h2 className="font-bold mb-4 text-lg">Miembros</h2>
           <ul>
            {miembros.map((user) => (
              <li key={user._id} className="flex items-center gap-2 mb-2">
                <img
                  src={
                    user.avatar && user.avatar.trim() !== ''
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}`
                  }
                  alt={user.nombre}
                  className="w-8 h-8 rounded-full object-cover border-2 border-purple-400"
                />
                <span className="truncate">{user.nombre}</span>
                {/* ...otros datos */}
              </li>
            ))}
          </ul>

          </aside>

          {/* Chat principal */}
          <main className="flex-1 p-2 sm:p-4 md:p-8 text-black dark:text-white flex flex-col min-h-screen">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
            >
              ← Volver
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
              💬 Chat del proyecto: {nombreProyecto}
            </h1>

            <div
              className="
                border rounded p-2 sm:p-4 mb-4
                h-[calc(100vh-180px)]
                sm:h-[450px] md:h-[600px]
                overflow-y-auto
                shadow-inner transition-colors
                bg-[linear-gradient(rgba(255,255,255,0.7),rgba(255,255,255,0.7)),url('/imgfondochat.png')]
                dark:bg-[linear-gradient(rgba(24,24,27,0.7),rgba(24,24,27,0.7)),url('/imgfondochat.png')]
                bg-cover bg-center bg-no-repeat
              "
            >
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {mensajes.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-300 italic">Aún no hay mensajes.</p>
                  ) : (
                    mensajes.map((msg) => {
                      const esMio = msg.usuario._id === usuario!._id;
                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.25 }}
                          className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              flex items-start gap-2 max-w-[80%] sm:max-w-[70%]
                              ${esMio
                                ? 'bg-blue-500 text-white dark:bg-blue-600 rounded-br-2xl rounded-tl-2xl rounded-bl-2xl ml-4 sm:ml-8'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl mr-4 sm:mr-8'
                              }
                              p-2 sm:p-3 shadow-sm transition-colors
                            `}
                          >
                            {!esMio && (
                              <img
                                src={
                                  msg.usuario.avatar && msg.usuario.avatar.trim() !== ''
                                    ? msg.usuario.avatar
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.usuario.nombre)}`
                                }
                                alt={msg.usuario.nombre}
                                className="w-8 h-8 rounded-full"
                              />

                            )}
                            <div>
                              {!esMio && (
                                <div className="font-semibold text-xs mb-1">{msg.usuario.nombre}</div>
                              )}
                              <div className="break-words">{msg.contenido}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            {esMio && (
                              <img
                                src={msg.usuario.avatar || '/avatar-default.png'}
                                alt={msg.usuario.nombre}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}

                  {/* Indicador "escribiendo" dentro del chat */}
                  {usuariosEscribiendo && usuariosEscribiendo.length > 0 && (
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <span className="animate-pulse text-gray-500 dark:text-gray-300 text-sm italic">
                        {usuariosEscribiendo.length === 1
                          ? `${miembros.find(u => u._id === usuariosEscribiendo[0])?.nombre || 'Alguien'} está escribiendo...`
                          : 'Varios usuarios están escribiendo...'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef}></div>
              </div>
            </div>

            <form className="bg-white dark:bg-gray-800 border rounded shadow p-2 sm:p-3 flex items-end gap-2 transition-colors" onSubmit={handleEnviar}>
              <textarea
                value={nuevoMensaje}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                className="w-full p-2 resize-none border rounded focus:outline-none overflow-hidden transition-all bg-white dark:bg-gray-700 dark:text-white"
                rows={1}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Enviar
              </button>
            </form>
          </main>
        </div>
      </div>
    </Layout>
);

};
