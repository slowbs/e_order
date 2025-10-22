import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Show a loading spinner or a blank page while checking auth status from localStorage
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div>Loading application...</div>
            </div>
        );
    }

    // If loading is finished, check for authentication.
    // If authenticated, render the child routes. Otherwise, redirect to login.
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}