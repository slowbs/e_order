import React from 'react'
import Dashboard from './components/Dashboard'
import CommandForm from './components/CommandForm'
import CommandList from './components/CommandList'
import EvaluationList from './components/EvaluationList'

export default function App(){
  const [view, setView] = React.useState('dashboard');
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">EO</div>
            <h1 className="text-lg md:text-2xl font-semibold">ระบบจัดเก็บคำสั่ง</h1>
          </div>
          <nav className="space-x-2">
            <button onClick={()=>setView('dashboard')} className={`px-4 py-2 rounded ${view==='dashboard' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>หน้าหลัก</button>
            <button onClick={()=>setView('new')} className={`px-4 py-2 rounded ${view==='new' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>เพิ่มคำสั่ง</button>
            <button onClick={()=>setView('list')} className={`px-4 py-2 rounded ${view==='list' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>ประวัติ</button>
            <button onClick={()=>setView('evaluation')} className={`px-4 py-2 rounded ${view==='evaluation' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>ประเมิน</button>
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
