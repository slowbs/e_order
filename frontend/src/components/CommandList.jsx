import React, { useEffect, useState, useCallback } from 'react'
import { fetchCommands, deleteCommand } from '../api'
import { api } from '../api'
import CommandForm from './CommandForm'
import { formatThaiDate, statusToThai, typeToThai } from '../utils/date'
import Modal from './Modal'
import toast from 'react-hot-toast'

export default function CommandList(){
  const [filters, setFilters] = useState({});
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
      const res = await fetchCommands({ ...filters, page, limit, q: searchTerm });
      if (res && Array.isArray(res.data)) {
          setRows(res.data);
          setTotal(res.total);
          setLimit(res.limit);
      } else {
          setRows([]);
          setTotal(0);
      }
  }, [filters, page, limit, searchTerm]);

  useEffect(() => { load(); }, [load]);

  // Listen for global data updates (e.g., after creating a new command)
  useEffect(() => {
      const handleUpdate = () => load();
      window.addEventListener('commands-updated', handleUpdate);
      return () => {
          window.removeEventListener('commands-updated', handleUpdate);
      };
  }, [load]);

  function onChange(e){ const {name,value} = e.target; setFilters(prev=>({...prev,[name]:value})); }
  function handleSearch() {
    if (page !== 1) setPage(1);
    else load();
  }

  function openEditModal(record) {
    // Sanitize the record before passing it to the form.
    // Convert any null values that might go into inputs to empty strings.
    const sanitizedRecord = {
      ...record,
      budget: record.budget === null ? '' : record.budget,
    };
    setEditing(sanitizedRecord);
    setIsModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ:\n"${title}"\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
        try {
            await deleteCommand(id);
            toast.success('ลบรายการสำเร็จ');
            // If the deleted item was the last one on the page, and it's not page 1, go to the previous page.
            if (rows.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                load();
            }
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการลบ');
        }
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
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

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed border border-slate-200">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50 divide-x divide-slate-200 border-b border-slate-200">
                <th className="p-3 font-medium w-[12%] text-center">หมายเลข</th>
                <th className="p-3 font-medium w-[40%] text-left">ชื่อเรื่อง</th>
                <th className="p-3 font-medium w-[10%] text-center">ประเภท</th>
                <th className="p-3 font-medium w-[10%] text-right">งบประมาณ</th>
                <th className="p-3 font-medium w-[14%] text-center">สถานะ</th>
                <th className="p-3 font-medium w-[12%] text-center">วันที่</th>
                <th className="p-3 font-medium w-[9%] text-center">หน่วยงาน</th>
                <th className="p-3 font-medium w-[8%] text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows && rows.map(r=> (
                <tr key={r.id} className="divide-x divide-slate-200">
                    <td className="p-2 text-center">{r.command_number}</td>
                    <td className="p-2 text-left">{r.title}</td>
                    <td className="p-2 text-center">{typeToThai(r.type)}</td>
                    <td className="p-2 text-right">{r.budget ? parseFloat(r.budget).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    <td className="p-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        r.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${ r.status === 'Completed' ? 'text-green-400' : r.status === 'In Progress' ? 'text-amber-400' : r.status === 'Cancelled' ? 'text-red-400' : 'text-slate-400' }`} fill="currentColor" viewBox="0 0 8 8">
                          <circle cx={4} cy={4} r={3} />
                        </svg>
                        {statusToThai(r.status)}
                      </span>
                    </td>
                    <td className="p-2 text-center">{formatThaiDate(r.date_received)}</td>
                    <td className="p-2 text-center">{r.agency}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap justify-center items-center gap-1">
                        {r.file_path && (
                          <a className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium transition-colors hover:bg-blue-600" href={`${import.meta.env.VITE_BACKEND_ROOT_URL}/${r.file_path}`} target="_blank" rel="noreferrer">ดูไฟล์</a>
                        )}
                        <button onClick={() => openEditModal(r)} className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium transition-colors hover:bg-orange-600">แก้ไข</button>
                        <button onClick={() => handleDelete(r.id, r.title)} className="inline-block px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium transition-colors hover:bg-red-600">ลบ</button>
                      </div>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} afterLeave={() => setEditing(null)} title={editing ? `แก้ไข: ${editing.title}` : ''}>
        {editing && (
          <div className="bg-white">
            <CommandForm key={editing.id} id={editing.id} initial={editing} onSaved={()=>{ setIsModalOpen(false); load(); }} onCancel={()=>setIsModalOpen(false)} />
          </div>
        )}
      </Modal>
    </div>
  )
}
