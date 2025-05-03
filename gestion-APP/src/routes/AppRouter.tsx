// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { Navbar } from '../components/Navbar';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { ProjectDetailPage } from '../modules/projects/ProjectDetailPage';
import { ProjectEditPage } from '../modules/projects/ProjectEditPage';
import { ProjectFormPage } from '../modules/projects/ProjectFormPage';
import { TaskListPage } from '../modules/tasks/TaskListPage';
import { TaskFormPage } from '../modules/tasks/TaskFormPage';
import { KanbanBoard } from '../modules/kanban/KanbanBoard';
import { EditTaskPage } from '../modules/kanban/EditTaskPage';


export const AppRouter = () => {
  const isAuthenticated = localStorage.getItem('auth') === 'true';

  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Ruta protegida de ejemplo */}
        <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
        path="/projects/:id"
        element={isAuthenticated ? <ProjectDetailPage /> : <Navigate to="/login" />}
        />
        <Route
        path="/projects/:id/edit"
        element={isAuthenticated ? <ProjectEditPage /> : <Navigate to="/login" />}
        /> 
        <Route
        path="/projects/new"
        element={isAuthenticated ? <ProjectFormPage /> : <Navigate to="/login" />}
        /> 
        <Route
        path="/projects/:id/tasks"
        element={isAuthenticated ? <TaskListPage /> : <Navigate to="/login" />}
        />
        <Route
        path="/projects/:id/tasks/new"
        element={isAuthenticated ? <TaskFormPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/:id/kanban"
          element={isAuthenticated ? <KanbanBoard /> : <Navigate to="/login" />}
        />
        <Route path="/projects/:id/kanban/edit/:taskId" element={<EditTaskPage />} />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
