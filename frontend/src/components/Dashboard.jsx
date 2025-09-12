import React, { useEffect, useState } from 'react'
import { fetchSummary, fetchCommands } from '../api'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'

export default function Dashboard(){
  const [summary, setSummary] = useState({});
  const [latest, setLatest] = useState([]);

  useEffect(()=>{ loadSummary(); loadLatest(); }, []);

  async function loadSummary(){
    const s = await fetchSummary();
    setSummary(s);
  }
  async function loadLatest(){
    const l = await fetchCommands({});
    setLatest(l.slice(0,20));
  }

  const base = (import.meta.env.VITE_API_BASE||'http://localhost/e_order/backend/api').replace(/\/api\/?$/,'');

  const types = [
    { key: 'TOR', label: 'TOR' },
    { key: 'Evaluation', label: 'พิจารณาผล' },
    { key: 'Inspection', label: 'ตรวจรับ' },
  ];

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {types.map(t=> (
          <div key={t.key} className="bg-white p-5 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-sm text-gray-600">{t.label}</h3>
            <div className="mt-3 flex items-baseline gap-4">
              <div className="text-3xl font-bold">{summary[t.key]?.['In Progress'] ?? 0}</div>
              <div className="text-sm text-gray-500">กำลังดำเนินการ</div>
            </div>
            <div className="mt-2 flex items-baseline gap-4">
              <div className="text-3xl font-bold">{summary[t.key]?.['Completed'] ?? 0}</div>
              <div className="text-sm text-gray-500">เสร็จสิ้น</div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-4">คำสั่งล่าสุด</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-gray-500"><th className="p-2">หมายเลข</th><th className="p-2">ชื้อเรื่อง</th><th className="p-2">ประเภท</th><th className="p-2">สถานะ</th><th className="p-2">วันที่</th><th className="p-2">File</th></tr>
            </thead>
            <tbody>
              {latest.map(r=> (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.command_number}</td>
                  <td className="p-2">{r.title}</td>
                  <td className="p-2">{typeToThai(r.type)}</td>
                  <td className="p-2">{statusToThai(r.status)}</td>
                  <td className="p-2">{formatThaiDate(r.date_received)}</td>
                  <td className="p-2">{r.file_path ? <a className="text-blue-600" href={`${base}/${r.file_path}`} target="_blank" rel="noreferrer">ดูไฟล์</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
