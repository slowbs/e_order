import React, { useState, useRef } from 'react'
import { createCommand } from '../api'

const defaultState = { command_number:'', title:'', date_received:'', document_type: 'คำสั่ง', type:'TOR', agency:'กองสาธารณสุข', budget: '', details:'', status:'In Progress' }

export default function CommandForm({ onSaved, initial = null, id = null, onCancel = null }){
  const [form, setForm] = useState(initial ? {...defaultState, ...initial} : defaultState);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef(null);

  function onChange(e){
    const { name, value } = e.target; setForm(prev=>({...prev,[name]:value}));
  }

  async function onSubmit(e){
    e.preventDefault(); setLoading(true);
    try{
      if (id) {
        // update
        if (file) {
          const fd = new FormData();
          for (const k in form) fd.append(k, form[k]);
          fd.append('file', file);
          await import('../api').then(m=>m.updateCommand(id, fd));
        } else {
          await import('../api').then(m=>m.updateCommand(id, form));
        }
      } else {
        const fd = new FormData();
        for (const k in form) fd.append(k, form[k]);
        if (file) fd.append('file', file);
        const res = await createCommand(fd);
      }
  alert('บันทึกเรียบร้อย');
      setForm(defaultState); setFile(null);
      if (onSaved) onSaved();
      if (onCancel) onCancel();
  }catch(err){ console.error(err); alert('เกิดข้อผิดพลาดในการบันทึก'); }
    setLoading(false);
  }

  return (
  <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* แถวที่ 1: ชนิดเอกสาร และ หมายเลขคำสั่ง */}
        <label className="block"><div className="text-sm">ชนิดเอกสาร</div><select name="document_type" value={form.document_type} onChange={onChange} className="mt-1 w-full border p-2 rounded">
          <option value="คำสั่ง">คำสั่ง</option>
          <option value="บันทึกข้อความ">บันทึกข้อความ</option>
        </select></label>
        <label className="block"><div className="text-sm">หมายเลขคำสั่ง</div><input name="command_number" value={form.command_number} onChange={onChange} className="mt-1 w-full border p-2 rounded" required /></label>

        {/* แถวที่ 2: วันที่ในเอกสาร และ ประเภทคำสั่ง */}
        <label className="block cursor-pointer" onClick={() => dateInputRef.current?.showPicker()}>
          <div className="text-sm">วันที่ในเอกสาร</div>
          <input ref={dateInputRef} type="date" name="date_received" value={form.date_received} onChange={onChange}
                 className="mt-1 w-full border p-2 rounded bg-white" required
                 onClick={(e) => e.preventDefault()}
          />
        </label>
        <label className="block"><div className="text-sm">ประเภทคำสั่ง</div><select name="type" value={form.type} onChange={onChange} className="mt-1 w-full border p-2 rounded">
          <option value="TOR">TOR (ข้อกำหนด)</option>
          <option value="Evaluation">พิจารณาผล</option>
          <option value="Inspection">ตรวจรับ</option>
        </select></label>

        {/* แถวที่ 3: ชื่อเรื่อง */}
        <label className="block md:col-span-2"><div className="text-sm">ชื่อเรื่อง</div><textarea name="title" value={form.title} onChange={onChange} className="mt-1 w-full border p-2 rounded" required rows="3"></textarea></label>

        {/* แถวที่ 4: หน่วยงาน และ งบประมาณ */}
        <label className="block"><div className="text-sm">หน่วยงาน</div><input name="agency" value={form.agency} onChange={onChange} className="mt-1 w-full border p-2 rounded" /></label>
        <label className="block"><div className="text-sm">งบประมาณ (บาท)</div><input type="number" name="budget" value={form.budget} onChange={onChange} className="mt-1 w-full border p-2 rounded" placeholder="0.00" step="0.01" /></label>

        {/* แถวที่ 5: สถานะ */}
        <label className="block"><div className="text-sm">สถานะ</div><select name="status" value={form.status} onChange={onChange} className="mt-1 w-full border p-2 rounded">
          <option value="In Progress">กำลังดำเนินการ</option>
          <option value="Completed">เสร็จสิ้น</option>
          <option value="Cancelled">ยกเลิก</option>
        </select></label>
        <label className="block md:col-span-2"><div className="text-sm">รายละเอียด</div><textarea name="details" value={form.details} onChange={onChange} className="mt-1 w-full border p-2 rounded" rows="4"></textarea></label>
        <label className="block md:col-span-2"><div className="text-sm">ไฟล์</div>
          {form.file_path && (
            <div className="mb-2 text-sm">ไฟล์ปัจจุบัน: <a className="text-blue-600" href={`${(import.meta.env.VITE_API_BASE||'http://localhost/e_order/backend/api').replace(/\/api\/?$/,'')}/${form.file_path}`} target="_blank" rel="noreferrer">เปิด</a></div>
          )}
          <input type="file" onChange={e=>setFile(e.target.files[0])} className="mt-1 block" />
          {form.file_path && <div className="text-xs text-gray-500 mt-1">การอัปโหลดไฟล์ใหม่จะทับไฟล์เดิม</div>}
        </label>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading? 'กำลังบันทึก...' : 'บันทึก'}</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 border rounded">ยกเลิก</button>}
        <div className="text-sm text-gray-500 ml-auto">กรุณากรอกช่องที่จำเป็น</div>
      </div>
    </form>
  )
}
