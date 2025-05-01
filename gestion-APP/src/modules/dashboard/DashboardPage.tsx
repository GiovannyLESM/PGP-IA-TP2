// src/modules/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { nombre } = JSON.parse(storedUser);
      setNombre(nombre);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {nombre} 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="bg-blue-500 text-white p-4 rounded shadow hover:bg-blue-600"
        >
          🗂️ Proyectos
        </button>

        <button
          onClick={() => navigate('/kanban')}
          className="bg-green-500 text-white p-4 rounded shadow hover:bg-green-600"
        >
          📌 Kanban
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="bg-purple-500 text-white p-4 rounded shadow hover:bg-purple-600"
        >
          💬 Chat
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="bg-yellow-500 text-white p-4 rounded shadow hover:bg-yellow-600"
        >
          👤 Perfil
        </button>
      </div>
    </div>
  );
};
