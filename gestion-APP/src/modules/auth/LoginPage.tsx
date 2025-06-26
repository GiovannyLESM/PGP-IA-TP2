import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../api/auth';
import { useMutation } from '@tanstack/react-query';

type LoginCredentials = {
  correo: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginUsuario,
    onSuccess: (data) => {
      login(data.token);
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (loading) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ correo, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white transition-colors duration-300">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md animate-fade-in"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {mutation.isError && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 text-sm">
            {mutation.error?.message || 'Error al iniciar sesión'}
          </div>
        )}

        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded transition duration-200"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full text-blue-600 dark:text-blue-300 hover:underline text-sm mt-3 text-center"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </form>
    </div>
  );
};
