import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/e_order/backend/api';

export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export async function fetchCommands(filters={}){
  const res = await api.get('/commands', { params: filters });
  return res.data;
}

export async function createCommand(formData){
  // formData is FormData for file upload
  const res = await api.post('/commands', formData, { headers: {'Content-Type':'multipart/form-data'} });
  return res.data;
}

export async function updateCommand(id, payload){
  // If payload is FormData (contains file), send as multipart POST to /commands/:id
  if (payload instanceof FormData) {
    const res = await api.post(`/commands/${id}`, payload, { headers: {'Content-Type':'multipart/form-data'} });
    return res.data;
  } else {
    const res = await api.put(`/commands/${id}`, payload);
    return res.data;
  }
}

export async function fetchSummary(fiscal_year){
  const res = await api.get('/summary', { params: { fiscal_year } });
  return res.data;
}
