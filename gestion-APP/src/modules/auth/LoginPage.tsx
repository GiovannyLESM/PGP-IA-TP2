import { useState } from 'react';
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
      navigate('/dashboard');
    },
  });

  if (loading) return null;

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ correo, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>

        {mutation.isError && (
          <p className="text-red-500 mb-2">
            {mutation.error?.message || 'Error al iniciar sesión'}
          </p>
        )}

        <input
          type="email"
          name='correo'
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <input
          type="password"
          name='password'
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-3"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full text-blue-600 dark:text-blue-300 hover:underline text-sm"
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </form>
    </div>
  );
};
