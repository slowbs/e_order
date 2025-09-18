import React from 'react'
import Dashboard from './components/Dashboard'
import CommandForm from './components/CommandForm'
import CommandList from './components/CommandList'
import EvaluationList from './components/EvaluationList'

export default function App(){
  const [view, setView] = React.useState('dashboard');
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-800 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold text-lg">EO</div>
            <h1 className="text-lg md:text-2xl font-semibold text-slate-100">ระบบจัดเก็บคำสั่ง</h1>
          </div>
          <nav className="space-x-2">
            <button onClick={()=>setView('dashboard')} className={`px-4 py-2 rounded-md font-medium transition-colors ${view==='dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>หน้าหลัก</button>
            <button onClick={()=>setView('new')} className={`px-4 py-2 rounded-md font-medium transition-colors ${view==='new' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>เพิ่มคำสั่ง</button>
            <button onClick={()=>setView('list')} className={`px-4 py-2 rounded-md font-medium transition-colors ${view==='list' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>ประวัติ</button>
            <button onClick={()=>setView('evaluation')} className={`px-4 py-2 rounded-md font-medium transition-colors ${view==='evaluation' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>ประเมิน</button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'dashboard' && <Dashboard />}
        {view === 'new' && <CommandForm onSaved={()=>setView('dashboard')} />}
        {view === 'list' && <CommandList />}
        {view === 'evaluation' && <EvaluationList />}
      </main>
    </div>
  )
}
