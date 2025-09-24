import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import CommandForm from './CommandForm';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const [isNewCommandModalOpen, setIsNewCommandModalOpen] = useState(false);

    const navLinkClass = ({ isActive }) => 
        `px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`;

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-800 text-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold text-lg">EO</div>
                        <h1 className="text-lg md:text-2xl font-semibold text-slate-100">ระบบจัดเก็บคำสั่ง</h1>
                    </div>
                    <nav className="space-x-2">
                        <NavLink to="/" end className={navLinkClass}>หน้าหลัก</NavLink>
                        <NavLink to="/history" className={navLinkClass}>ประวัติ</NavLink>
                        <NavLink to="/evaluation" className={navLinkClass}>ประเมิน</NavLink>
                        <button onClick={() => setIsNewCommandModalOpen(true)} className="px-4 py-2 rounded-md font-medium transition-colors bg-amber-500 text-white hover:bg-amber-600">+ เพิ่มคำสั่ง</button>
                        <button onClick={logout} className="px-4 py-2 rounded-md font-medium transition-colors bg-red-600 text-white hover:bg-red-700">Logout</button>
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