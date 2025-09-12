import React, { useEffect, useState } from 'react'
import { fetchCommands } from '../api'
import { api } from '../api'
import CommandForm from './CommandForm'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'

export default function CommandList(){
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(()=>{ load(); }, []);
  async function load(){ const r = await fetchCommands(filters); setRows(r); }

  function onChange(e){ const {name,value} = e.target; setFilters(prev=>({...prev,[name]:value})); }

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input name="fiscal_year" placeholder="ปีงบ (เช่น 68)" onChange={onChange} className="border p-2 rounded" />
          <select name="fiscal_half" onChange={onChange} className="border p-2 rounded"><option value="">ปีงบประมาณ</option><option value="first_half">ต.ค.–มี.ค.</option><option value="second_half">เม.ย.–ก.ย.</option></select>
          <select name="type" onChange={onChange} className="border p-2 rounded"><option value="">ทุกประเภท</option><option>TOR</option><option>Evaluation</option><option>Inspection</option></select>
          <select name="status" onChange={onChange} className="border p-2 rounded"><option value="">สถานะการดำเนินการ</option><option>In Progress</option><option>Completed</option></select>
        </div>
  <div className="mt-2"><button onClick={load} className="px-3 py-1 bg-blue-600 text-white rounded">ค้นหา</button></div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500"><th className="p-2">หมายเลข</th><th className="p-2">ชื่อเรื่อง</th><th className="p-2">ประเภท</th><th className="p-2">สถานะ</th><th className="p-2">วันที่</th><th className="p-2">หน่วยงาน</th><th className="p-2"></th></tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.id} className="border-t">
                    <td className="p-2">{r.command_number}</td>
                    <td className="p-2">{r.title}</td>
                    <td className="p-2">{typeToThai(r.type)}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${r.status==='Completed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{statusToThai(r.status)}</span></td>
                    <td className="p-2">{formatThaiDate(r.date_received)}</td>
                    <td className="p-2">{r.agency}</td>
                    <td className="p-2 text-right space-x-2">
                      {r.file_path && (
                        <a className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs" href={`${api.defaults.baseURL.replace(/\/api\/?$/,'')}/${r.file_path}`} target="_blank" rel="noreferrer">ดูไฟล์</a>
                      )}
                      <button onClick={()=>setEditing(r)} className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded text-xs">แก้ไข</button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="mt-4">
          <h3 className="mb-2 font-semibold">แก้ไขคำสั่ง {editing.command_number}</h3>
          <CommandForm id={editing.id} initial={editing} onSaved={()=>{ setEditing(null); load(); }} onCancel={()=>setEditing(null)} />
        </div>
      )}
    </div>
  )
}
