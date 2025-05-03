import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
}

export const ChatPage = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('proyectos');
    if (stored) {
      setProyectos(JSON.parse(stored));
    }
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

      {proyectos.length === 0 ? (
        <p className="text-gray-600">No hay proyectos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {proyectos.map((p) => (
            <li
              key={p.id}
              className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{p.nombre}</h2>
                <p className="text-sm text-gray-500">{p.descripcion}</p>
              </div>
              <button
                onClick={() => navigate(`/projects/${p.id}/chat`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Ir al chat
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
