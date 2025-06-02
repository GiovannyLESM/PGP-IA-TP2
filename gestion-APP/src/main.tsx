import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';

import { QueryClient,QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

if (shouldUseDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
