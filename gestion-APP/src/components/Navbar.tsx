// src/components/Navbar.tsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-900 dark:text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Gestión de Proyectos</h1>
      <div className="flex gap-4">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-700 dark:bg-gray-200 dark:text-black px-4 py-2 rounded hover:opacity-90 transition"
        >
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};
