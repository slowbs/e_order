import React, { useEffect, useState } from 'react'
import { fetchCommands } from '../api'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'

export default function EvaluationList(){
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(()=>{ load(); }, [page]);
  async function load(){ 
    const res = await fetchCommands({ ...filters, page, limit, q: searchTerm }); 
    if (res && Array.isArray(res.data)) {
      setRows(res.data);
      setTotal(res.total);
      setLimit(res.limit);
    } else {
      setRows([]);
      setTotal(0);
    }
  }

  function onChange(e){ const {name,value} = e.target; setFilters(prev=>({...prev,[name]:value})); }
  function handleSearch() {
    if (page !== 1) setPage(1);
    else load();
  }

  const totalPages = Math.ceil(total / limit);
  
  return (
    <div>
      {/* Filter section - same as CommandList */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input name="fiscal_year" placeholder="ปีงบ (เช่น 68)" onChange={onChange} className="border p-2 rounded" />
          <select name="fiscal_half" onChange={onChange} className="border p-2 rounded"><option value="">ทุกรอบการประเมิน</option><option value="first_half">ต.ค.–มี.ค.</option><option value="second_half">เม.ย.–ก.ย.</option></select>
          <select name="type" onChange={onChange} className="border p-2 rounded">
            <option value="">ทุกประเภท</option>
            <option value="TOR">TOR</option>
            <option value="Evaluation">พิจารณาผล</option>
            <option value="Inspection">ตรวจรับ</option>
          </select>
          <select name="status" onChange={onChange} className="border p-2 rounded">
            <option value="">ทุกสถานะ</option>
            <option value="In Progress">กำลังดำเนินการ</option><option value="Completed">เสร็จสิ้น</option><option value="Cancelled">ยกเลิก</option>
          </select>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="ค้นหาเลขที่/ชื่อเรื่อง..." className="border p-2 rounded" />
          </div>
          <button onClick={handleSearch} className="px-3 py-2 bg-blue-600 text-white rounded">ค้นหา</button>
        </div>
      </div>

      {/* Table section - new layout */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed border border-slate-200">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
                <th className="p-3 font-medium w-[5%] text-center">ลำดับ</th>
                <th className="p-3 font-medium w-[60%] text-left">รายการ</th>
                <th className="p-3 font-medium w-[10%] text-center">ประเภท</th>
                <th className="p-3 font-medium w-[10%] text-center">วันที่</th>
                <th className="p-3 font-medium w-[12%] text-right">งบประมาณ</th>
                <th className="p-3 font-medium w-[14%] text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows && rows.map((r, index) => (
                <tr key={r.id} className="divide-x divide-slate-200">
                    <td className="p-2 text-center">{(page - 1) * limit + index + 1}</td>
                    <td className="p-2 text-left">
                      {r.details ? `${r.details} ` : ''}ตาม {r.document_type} เลขที่ {r.command_number}
                    </td>
                    <td className="p-2 text-center">{typeToThai(r.type)}</td>
                    <td className="p-2 text-center">{formatThaiDate(r.date_received)}</td>
                    <td className="p-2 text-right">{r.budget ? parseFloat(r.budget).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    <td className="p-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        r.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        <svg className={`-ml-0-5 mr-1.5 h-2 w-2 ${ r.status === 'Completed' ? 'text-green-400' : r.status === 'In Progress' ? 'text-amber-400' : r.status === 'Cancelled' ? 'text-red-400' : 'text-slate-400' }`} fill="currentColor" viewBox="0 0 8 8">
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                        {statusToThai(r.status)}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>แสดง {rows.length} จากทั้งหมด {total} รายการ</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">ก่อนหน้า</button>
            <span>หน้า {page} / {totalPages > 0 ? totalPages : 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || total === 0} className="px-3 py-1 border rounded disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  )
}