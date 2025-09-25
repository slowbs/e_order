import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await loginUser({ username, password });
            
            // The login function from AuthContext will handle storing the token and user data
            login(response.data.user, response.data.token);

            toast.success('Login successful!');
            // The App's routing logic will automatically redirect us to the dashboard.

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md border border-slate-200">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center font-bold text-2xl text-white mb-3">EO</div>
                    <h1 className="text-2xl font-bold text-slate-800">ระบบจัดเก็บคำสั่ง</h1>
                    <p className="text-slate-500 mt-1">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            ชื่อผู้ใช้งาน
                        </label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            รหัสผ่าน
                        </label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}