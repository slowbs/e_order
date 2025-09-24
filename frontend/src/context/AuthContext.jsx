import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api'; // Import the global api instance

// 1. Create the context
const AuthContext = createContext(null);

/**
 * The AuthProvider component that will wrap our entire application.
 * It holds the authentication state and provides functions to login/logout.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // When the app loads, check if a token exists in localStorage.
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            // If we have a token and user, set them in our state.
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            // Also, update the api instance to use this token for all future requests.
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        // We are done with the initial loading.
        setIsLoading(false);
    }, []);

    const login = (userData, userToken) => {
        // 1. Store token and user data in localStorage
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // 2. Update the api instance to use the new token
        api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

        // 3. Update the state
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        // 1. Clear token and user from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // 2. Remove the Authorization header from the api instance
        delete api.defaults.headers.common['Authorization'];

        // 3. Reset the state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // The value provided to consuming components
    const value = { user, token, isAuthenticated, isLoading, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook to easily access the authentication context.
 * e.g., `const { user, login } = useAuth();`
 */
export const useAuth = () => {
    return useContext(AuthContext);
};