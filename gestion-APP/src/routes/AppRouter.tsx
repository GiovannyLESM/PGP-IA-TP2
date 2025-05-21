import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { ProjectDetailPage } from '../modules/projects/ProjectDetailPage';
import { ProjectEditPage } from '../modules/projects/ProjectEditPage';
import { ProjectFormPage } from '../modules/projects/ProjectFormPage';
import { TaskListPage } from '../modules/tasks/TaskListPage';
import { TaskFormPage } from '../modules/tasks/TaskFormPage';
import { KanbanBoard } from '../modules/kanban/KanbanBoard';
import { EditTaskPage } from '../modules/kanban/EditTaskPage';
import { ChatPage } from '../modules/chat/ChatPage';
import { ProjectChatPage } from '../modules/chat/ProjectChatPage';
import { ProfilePage } from '../modules/profile/ProfilePage';
import { PrivateRoute } from '../components/PrivateRoute';
import { Navbar } from '../components/Navbar';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Privadas */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
        <Route path="/projects/:id/edit" element={<PrivateRoute><ProjectEditPage /></PrivateRoute>} />
        <Route path="/projects/new" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} />
        <Route path="/projects/:id/tasks" element={<PrivateRoute><TaskListPage /></PrivateRoute>} />
        <Route path="/projects/:id/tasks/new" element={<PrivateRoute><TaskFormPage /></PrivateRoute>} />
        <Route path="/projects/:id/kanban" element={<PrivateRoute><KanbanBoard /></PrivateRoute>} />
        <Route path="/projects/:id/kanban/edit/:taskId" element={<PrivateRoute><EditTaskPage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/projects/:id/chat" element={<PrivateRoute><ProjectChatPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};
