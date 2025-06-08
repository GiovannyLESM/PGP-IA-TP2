import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();


  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-900 dark:text-white px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Gestión de Proyectos</h1>
      <div className="flex gap-4 items-center">
        <button
          onClick={toggleDarkMode}
          className="bg-gray-700 dark:bg-gray-200 dark:text-black px-4 py-2 rounded hover:opacity-90 transition"
        >
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </nav>
  );
};
