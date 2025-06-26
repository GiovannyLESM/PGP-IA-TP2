import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrarUsuario } from '../../api/auth';
import { useMutation } from '@tanstack/react-query';

type RegisterData = {
  nombre: string;
  correo: string;
  password: string;
};

type RegisterResponse = {
  msg: string;
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    captcha: false,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const mutation = useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: registrarUsuario,
    onSuccess: (data) => {
      setLocalError(null);
      // Mostrar mensaje de éxito y navegar luego de un tiempo
      setSuccessMessage(data.msg)
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    },
    onError: (error) => {
      setLocalError(error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
    setLocalError(null); // limpiar error al cambiar inputs
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, correo, password, confirmPassword, captcha } = form;

    // Validaciones locales
    if (!nombre || !correo || !password || !confirmPassword) {
      return setLocalError('Todos los campos son obligatorios');
    }

    if (password.length < 6) {
      return setLocalError('La contraseña debe tener al menos 6 caracteres');
    }

    if (password !== confirmPassword) {
      return setLocalError('Las contraseñas no coinciden');
    }

    if (!captcha) {
      return setLocalError('Debes marcar el captcha');
    }

    // Ejecutar mutación
    mutation.mutate({ nombre, correo, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in animate-[var(--animate-fade-in)]"
      >
        <h2 className="text-2xl font-bold mb-4">Registro</h2>

        {(localError || mutation.isError) && (
          <div className="mb-4 p-2 rounded bg-red-100 text-red-700 border border-red-300 text-sm">
            {localError || mutation.error?.message}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2 rounded bg-green-100 text-green-700 border border-green-300 text-sm animate-pulse">
            {successMessage}
          </div>
        )}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
          required
        />

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            name="captcha"
            checked={form.captcha}
            onChange={handleChange}
            className="mr-2"
          />
          No soy un robot
        </label>

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Registrando...' : 'Registrarse'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-blue-600 dark:text-blue-300 hover:underline text-sm mt-2"
        >
          ¿Ya tienes una cuenta? Inicia sesión
        </button>
      </form>
    </div>
  );
};
