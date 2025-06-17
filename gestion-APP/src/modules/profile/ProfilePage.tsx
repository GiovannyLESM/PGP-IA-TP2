import { useState, ChangeEvent, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajusta a tu contexto real
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Usuario,
  obtenerPerfil,
  actualizarPerfil,
  actualizarAvatar,
  cambiarPassword
} from '../../api/usuario';
import { Layout } from '../../components/Layout';
import { Sidebar } from '../../components/Sidebar';
export const ProfilePage = () => {
  const { token } = useAuth();
  
  // Estado para el form
  const [form, setForm] = useState<Usuario>({
    id: '',
    nombre: '',
    apellido: '',
    correo: '',
    avatar: '',
  });
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  // Carga el perfil del usuario
  const { data: usuario, refetch, isLoading } = useQuery<Usuario>({
    queryKey: ['perfil', token],
    queryFn: () => obtenerPerfil(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (usuario) setForm(usuario);
  }, [usuario]);

  // Mutaciones
  const mutationPerfil = useMutation({
    mutationFn: () => actualizarPerfil(token!, { nombre: form.nombre, apellido: form.apellido }),
    onSuccess: (data) => {
      setMensaje(data.msg);
      setEditando(false);
      setUsuario(data.usuario); // <-- Actualiza el contexto global
      refetch();
    },
    onError: (err: any) => setError(err.message || 'Error al actualizar perfil')
  });

  const mutationAvatar = useMutation({
    mutationFn: () => actualizarAvatar(token!, form.avatar!),
    onSuccess: (data) => {
      setMensaje(data.msg);
      refetch();
    },
    onError: (err: any) => setError(err.message || 'Error al actualizar avatar')
  });

  const mutationPassword = useMutation({
    mutationFn: () => cambiarPassword(token!, passwordActual, nuevaPassword),
    onSuccess: (data) => {
      setMensaje(data.msg);
      setPasswordActual('');
      setNuevaPassword('');
      setMostrarPassword(false);
    },
    onError: (err: any) => setError(err.message || 'Error al cambiar contraseña')
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    mutationPerfil.mutate();
    if (form.avatar && form.avatar !== usuario?.avatar) {
      mutationAvatar.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <div className="text-center text-gray-500">Cargando perfil...</div>
      </div>
    );
  }

return (
  <Layout>
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex justify-center items-start py-8 px-2 sm:px-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center sm:text-left">
            👤 Perfil del Usuario
          </h1>
          <div className="bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-10 rounded-2xl space-y-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <img
                src={
                  editando
                    ? form.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nombre)}`
                    : usuario?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario?.nombre || "")}`
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
              <div className="flex-1 w-full">
                {editando ? (
                  <form onSubmit={handleGuardar} className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
                        placeholder="Nombre"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200">Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
                        placeholder="Apellido"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200">Correo</label>
                      <input
                        type="email"
                        name="correo"
                        value={form.correo}
                        disabled
                        className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Correo"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200">Foto de perfil</label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                          Subir imagen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImagen}
                            className="hidden"
                          />
                        </label>
                        {form.avatar && (
                          <span className="text-sm text-green-600">✅ Imagen cargada</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        💾 Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (usuario) setForm(usuario);
                          setEditando(false);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{usuario?.nombre} {usuario?.apellido}</p>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{usuario?.correo}</p>
                  </div>
                )}
              </div>
            </div>
            {!editando && (
              <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3">
                <button
                  onClick={() => {
                    if (usuario) setForm(usuario);
                    setEditando(true);
                  }}
                  disabled={!usuario}
                  className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md text-base font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
                >
                  <span>✏️</span> Editar perfil
                </button>
                <button
                  onClick={() => setMostrarPassword(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-base font-semibold hover:bg-blue-700 transition"
                >
                  <span>🔒</span> Cambiar contraseña
                </button>
              </div>
            )}
            {/* Cambio de contraseña */}
            {mostrarPassword && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setError("");
                  setMensaje("");
                  mutationPassword.mutate();
                }}
                className="space-y-4 mt-2"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-200">Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={passwordActual}
                    onChange={e => setPasswordActual(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-200">Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={nuevaPassword}
                    onChange={e => setNuevaPassword(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Actualizar contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(false)}
                    className="text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
            {mensaje && <div className="text-green-600 text-center">{mensaje}</div>}
            {error && <div className="text-red-600 text-center">{error}</div>}
          </div>
        </div>
      </main>
    </div>
  </Layout>
);

};
