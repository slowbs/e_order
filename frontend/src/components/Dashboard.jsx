import React, { useEffect, useState } from 'react'
import { fetchSummary, fetchCommands } from '../api'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [latest, setLatest] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { loadLatest(); }, [page]); // Reload when page changes

  async function loadSummary() {
    const s = await fetchSummary();
    setSummary(s);
  }
  async function loadLatest() {
    const res = await fetchCommands({ page, limit, q: searchTerm });
    if (res && Array.isArray(res.data)) {
      setLatest(res.data);
      setTotal(res.total);
      setLimit(res.limit);
    }
  }

  function handleSearch() {
    if (page !== 1) {
      setPage(1); // This will trigger useEffect and reload
    } else {
      loadLatest(); // If already on page 1, just reload
    }
  }

  const base = (import.meta.env.VITE_API_BASE || 'http://localhost/e_order/backend/api').replace(/\/api\/?$/, '');

  const types = [
    { key: 'TOR', label: 'TOR' },
    { key: 'Evaluation', label: 'พิจารณาผล' },
    { key: 'Inspection', label: 'ตรวจรับ' },
  ];

  const icons = {
    TOR: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    Evaluation: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m--6 9l2 2 4-4" />
      </svg>
    ),
    Inspection: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z" />
      </svg>
    ),
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {types.map(t => (
          <div key={t.key} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-slate-700">{t.label}</h3>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">{icons[t.key]}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-amber-500">{summary[t.key]?.['In Progress'] ?? 0}</div>
                <div className="text-sm text-slate-500">กำลังดำเนินการ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-500">{summary[t.key]?.['Completed'] ?? 0}</div>
                <div className="text-sm text-slate-500">เสร็จสิ้น</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="font-semibold text-lg text-slate-800">คำสั่งล่าสุด</h3>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="ค้นหาเลขที่/ชื่อเรื่อง..." className="border p-2 rounded w-full md:w-auto" />
            <button onClick={handleSearch} className="px-3 py-2 bg-blue-600 text-white rounded">ค้นหา</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse table-fixed">
            <thead>
              <tr className="text-left text-xs text-slate-500 bg-slate-50">
                <th className="p-3 font-medium w-[10%]">หมายเลข</th>
                <th className="p-3 font-medium w-[50%]">ชื้อเรื่อง</th>
                <th className="p-3 font-medium w-[10%]">ประเภท</th>
                <th className="p-3 font-medium w-[10%]">สถานะ</th>
                <th className="p-3 font-medium w-[10%]">วันที่</th>
                <th className="p-3 font-medium w-[5%]">File</th></tr>
            </thead>
            <tbody>
              {latest && latest.map(r => (
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
        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>แสดง {latest.length} จากทั้งหมด {total} รายการ</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">ก่อนหน้า</button>
            <span>หน้า {page} / {totalPages > 0 ? totalPages : 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || total === 0} className="px-3 py-1 border rounded disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      </section>
    </div>
  )
}
