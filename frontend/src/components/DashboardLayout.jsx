import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import CommandForm from './CommandForm';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const [isNewCommandModalOpen, setIsNewCommandModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const navLinkClass = ({ isActive }) => 
        `px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

    // Effect to close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [userMenuRef]);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-800 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold text-lg">EO</div>
                        <h1 className="text-lg md:text-2xl font-semibold text-slate-100">ระบบจัดเก็บคำสั่ง</h1>
                    </div>
                    <nav className="flex items-center gap-2">
                        <NavLink to="/" end className={navLinkClass}>หน้าหลัก</NavLink>
                        <NavLink to="/history" className={navLinkClass}>ประวัติ</NavLink>
                        <NavLink to="/evaluation" className={navLinkClass}>ประเมิน</NavLink>
                        <button onClick={() => setIsNewCommandModalOpen(true)} className="px-4 py-2 rounded-md font-medium transition-colors bg-amber-500 text-white hover:bg-amber-600">+ เพิ่มคำสั่ง</button>
                        
                        {/* User Dropdown Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors bg-slate-700 text-slate-200 hover:bg-slate-600">
                                <span>{user?.name || 'User'}</span>
                                <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
                                    <button 
                                        onClick={() => {
                                            logout();
                                            setIsUserMenuOpen(false);
                                        }} 
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>
                                            ออกจากระบบ
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-6">
                <Outlet /> {/* This is where the child routes will be rendered */}
            </main>
            <Modal isOpen={isNewCommandModalOpen} onClose={() => setIsNewCommandModalOpen(false)} title="เพิ่มคำสั่งใหม่">
                <div className="bg-white"><CommandForm onSaved={() => setIsNewCommandModalOpen(false)} onCancel={() => setIsNewCommandModalOpen(false)} /></div>
            </Modal>
        </div>
    );
}