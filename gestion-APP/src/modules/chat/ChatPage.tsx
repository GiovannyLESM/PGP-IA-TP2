import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Proyecto {
  _id: string;
  nombre: string;
  descripcion: string;
}

export const ChatPage = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects', {
      // Si necesitas token:
      // headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProyectos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver al dashboard
      </button>
      <h1 className="text-3xl font-bold mb-6">💬 Chats por Proyecto</h1>

      {loading ? (
        <p className="text-gray-600">Cargando proyectos...</p>
      ) : proyectos.length === 0 ? (
        <p className="text-gray-600">No hay proyectos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {proyectos.map((proyecto) => (
            <li
              key={proyecto._id}
              className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{proyecto.nombre}</h2>
                <p className="text-sm text-gray-500">{proyecto.descripcion}</p>
              </div>
              <button
                onClick={() => navigate(`/projects/${proyecto._id}/chat`)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
              >
                💬 Chat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
