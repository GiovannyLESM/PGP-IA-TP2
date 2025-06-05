import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API helpers
const obtenerInvitacionesPendientes = async (token: string) => {
  const res = await fetch('http://localhost:5000/api/users/invitaciones', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo obtener invitaciones');
  return res.json();
};
const aceptarInvitacion = async (token: string, id: string) => {
  const res = await fetch(`http://localhost:5000/api/users/invitaciones/${id}/aceptar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo aceptar la invitación');
  return res.json();
};
const rechazarInvitacion = async (token: string, id: string) => {
  const res = await fetch(`http://localhost:5000/api/users/invitaciones/${id}/rechazar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('No se pudo rechazar la invitación');
  return res.json();
};

export const Navbar = () => {
  const { isAuthenticated, logout, token } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  // Solo carga invitaciones cuando el panel está abierto
  const { data: invitaciones = [], refetch, isLoading } = useQuery({
    queryKey: ['invitaciones-navbar', token],
    queryFn: () => obtenerInvitacionesPendientes(token!),
    enabled: !!token,
    refetchInterval: 10000, // Opcional: refresca cada 10s
  });

  const aceptarMutation = useMutation({
    mutationFn: (id: string) => aceptarInvitacion(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones-navbar', token] });
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      refetch();
    }
  });
  const rechazarMutation = useMutation({
    mutationFn: (id: string) => rechazarInvitacion(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones-navbar', token] });
      refetch();
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-900 dark:text-white px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Gestión de Proyectos</h1>
      <div className="flex gap-4 items-center">
        {/* Campanita */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative focus:outline-none"
            title="Ver invitaciones"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {invitaciones.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1.5 py-0.5">
                {invitaciones.length}
              </span>
            )}
          </button>
          {/* Popover de invitaciones */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded shadow-lg z-50 p-4 border dark:bg-gray-800 dark:text-white">
              <h3 className="font-semibold mb-2">Invitaciones</h3>
              {isLoading && <div className="text-sm text-gray-400">Cargando...</div>}
              {!isLoading && invitaciones.length === 0 && (
                <div className="text-sm text-gray-400">No tienes invitaciones pendientes.</div>
              )}
              {invitaciones.map((inv: any) => (
                <div key={inv._id} className="mb-3 border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <b>{inv.proyecto?.nombre}</b>
                    <div className="text-xs text-gray-500">
                      Invitado por: {inv.usuarioInvitador?.nombre || inv.usuarioInvitador?.correo}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => aceptarMutation.mutate(inv._id)}
                      disabled={aceptarMutation.isPending}
                    >
                      Aceptar
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => rechazarMutation.mutate(inv._id)}
                      disabled={rechazarMutation.isPending}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
