import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard'
import CommandList from './components/CommandList';
import EvaluationList from './components/EvaluationList';
import LoginPage from './pages/LoginPage';

export default function App(){
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* If user is authenticated and goes to /login, redirect to home. Otherwise, show login page. */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        
        {/* All routes inside here are protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<CommandList />} />
            <Route path="/evaluation" element={<EvaluationList />} />
            {/* Add other protected routes here in the future */}
          </Route>
        </Route>
        
        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  )
}
