import React, { useEffect, useState } from 'react'
import { fetchCommands } from '../api'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'

export default function EvaluationList(){
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(()=>{ load(); }, [page]);
  async function load(){ 
    const res = await fetchCommands({ ...filters, page, limit }); 
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
          <select name="fiscal_half" onChange={onChange} className="border p-2 rounded"><option value="">ปีงบประมาณ</option><option value="first_half">ต.ค.–มี.ค.</option><option value="second_half">เม.ย.–ก.ย.</option></select>
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
        <div className="mt-2"><button onClick={handleSearch} className="px-3 py-1 bg-blue-600 text-white rounded">ค้นหา</button></div>
      </div>

      {/* Table section - new layout */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="p-2 w-16">ลำดับ</th>
                <th className="p-2">รายการ</th>
                <th className="p-2 w-32">ประเภท</th>
                <th className="p-2 w-32">วันที่</th>
                <th className="p-2 w-40 text-right">งบประมาณ</th>
                <th className="p-2 w-40">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {rows && rows.map((r, index) => (
                <tr key={r.id} className="border-t">
                    <td className="p-2 text-center">{(page - 1) * limit + index + 1}</td>
                    <td className="p-2">
                      {r.details ? `${r.details} ` : ''}ตาม {r.document_type} เลขที่ {r.command_number}
                    </td>
                    <td className="p-2">{typeToThai(r.type)}</td>
                    <td className="p-2">{formatThaiDate(r.date_received)}</td>
                    <td className="p-2 text-right">{r.budget ? parseFloat(r.budget).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${
                      r.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      r.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                      r.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{statusToThai(r.status)}</span></td>
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