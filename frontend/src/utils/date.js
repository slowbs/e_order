export function formatThaiDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = d.getDate();
  const monthAbbr = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const beYear = d.getFullYear() + 543;
  return `${day} ${monthAbbr[d.getMonth()]} ${beYear}`;
}

export function statusToThai(status) {
  if (!status) return '';
  const map = {
    'In Progress': 'กำลังดำเนินการ',
    'Completed': 'เสร็จสิ้น',
    'Cancelled': 'ยกเลิก'
  };
  return map[status] || status;
}

export function typeToThai(type) {
  const map = {
    'TOR': 'TOR',
    'Evaluation': 'พิจารณาผล',
    'Inspection': 'ตรวจรับ'
  };
  return map[type] || type;
}
