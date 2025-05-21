import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrarUsuario } from '../../api/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: '',
    captcha: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, correo, password, confirmPassword, captcha } = form;

    if (!nombre || !correo || !password || !confirmPassword) {
      return setError('Todos los campos son obligatorios');
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (!captcha) {
      return setError('Debes marcar el captcha');
    }

    try {
      const data = await registrarUsuario({ nombre, correo, password });
      setSuccess(data.msg);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Registro</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
        />

        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
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
        >
          Registrarse
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
