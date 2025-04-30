// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { Navbar } from '../components/Navbar';

export const AppRouter = () => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';

  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Ruta protegida de ejemplo */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <h1>Bienvenido al Dashboard</h1> : <Navigate to="/login" />}
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
