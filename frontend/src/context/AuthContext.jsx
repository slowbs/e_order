import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, fetchCommands } from '../api'; // Import the global api instance and fetchCommands

// 1. Create the context
const AuthContext = createContext(null);

/**
 * The AuthProvider component that will wrap our entire application.
 * It holds the authentication state and provides functions to login/logout.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null); // Initialize token state to null
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as not authenticated
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                // Set token for API calls immediately so subsequent requests include it
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                
                try {
                    // Attempt to fetch a protected resource to verify the token's validity
                    await fetchCommands({ limit: 1 }); // A lightweight call to a protected endpoint
                    
                    // If successful, the token is valid
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                } catch (error) {
                    // If API call fails (e.g., 401 Unauthorized, token expired), clear invalid data
                    console.error("Token verification failed:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete api.defaults.headers.common['Authorization'];
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false); // Finished initial loading check
        };

        verifyAuth();
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