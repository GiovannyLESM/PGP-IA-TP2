import { useEffect, useState, ChangeEvent } from 'react';

interface Usuario {
  nombre: string;
  correo: string;
  avatar?: string;
}

export const ProfilePage = () => {
  const [usuario, setUsuario] = useState<Usuario>({
    nombre: '',
    correo: '',
    avatar: '',
  });

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Usuario>({ nombre: '', correo: '', avatar: '' });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored);
      setUsuario(user);
      setForm(user);
    }
  }, []);

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

  const handleGuardar = () => {
    localStorage.setItem('user', JSON.stringify(form));
    setUsuario(form);
    setEditando(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">👤 Perfil del Usuario</h1>

      <div className="bg-white shadow p-6 rounded space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={
              form.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(form.nombre)}`
            }
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div className="flex-1">
            {!editando ? (
              <>
                <p className="text-xl font-semibold">{usuario.nombre}</p>
                <p className="text-gray-600 text-sm">{usuario.correo}</p>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Nombre"
                />
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                />

                <label className="block">
                  <span className="block text-sm text-gray-700 mb-1">Foto de perfil</span>
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
                </label>
              </div>
            )}
          </div>
        </div>

        {!editando ? (
          <button
            onClick={() => setEditando(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            ✏️ Editar perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              💾 Guardar
            </button>
            <button
              onClick={() => {
                setForm(usuario);
                setEditando(false);
              }}
              className="text-red-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
