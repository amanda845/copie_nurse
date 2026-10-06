const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'nurseflow_access_token'
const NURSE_KEY = 'nurseflow_active_nurse_id'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearSession() {
  setAccessToken('')
  localStorage.removeItem(NURSE_KEY)
}

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getAccessToken()
  const nurseId = localStorage.getItem(NURSE_KEY)
  if (token) headers.Authorization = `Bearer ${token}`
  if (nurseId) headers['X-Nurse-Id'] = nurseId

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || `Erreur API ${response.status}`)
    error.status = response.status
    throw error
  }
  return payload
}

export async function apiStartShift(nurseId) {
  const payload = await apiRequest('/auth/shift', { method: 'POST', body: JSON.stringify({ nurseId }) })
  setAccessToken(payload.token)
  return payload.nurse
}

export async function apiLogin(email, password) {
  const payload = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  setAccessToken(payload.token)
  localStorage.setItem(NURSE_KEY, payload.nurse.id)
  return payload.nurse
}

export async function apiRegister(data) {
  const payload = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) })
  setAccessToken(payload.token)
  localStorage.setItem(NURSE_KEY, payload.nurse.id)
  return payload.nurse
}

export const apiListNurses = () => apiRequest('/nurses')
export const apiListActivity = (params = '') => apiRequest(`/activity${params}`)
export const apiRecordActivity = (data) => apiRequest('/activity/manual', { method: 'POST', body: JSON.stringify(data) })
export const apiCreateNurse = (data) => apiRequest('/nurses', { method: 'POST', body: JSON.stringify(data) })
export const apiUpdateNurse = (id, data) => apiRequest(`/nurses/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const apiDeleteNurse = (id) => apiRequest(`/nurses/${id}`, { method: 'DELETE' })
export const apiListPatients = () => apiRequest('/patients')
export const apiGetPatient = (id) => apiRequest(`/patients/${id}`)
export const apiCreatePatient = (data) => apiRequest('/patients', { method: 'POST', body: JSON.stringify(data) })
export const apiUpdatePatient = (id, data) => apiRequest(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const apiCreateFeedback = (data) => apiRequest('/feedback', { method: 'POST', body: JSON.stringify(data) })
export const apiCreateTreatment = (data) => apiRequest('/treatments', { method: 'POST', body: JSON.stringify(data) })
export const apiUpdateTreatment = (id, data) => apiRequest(`/treatments/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const apiDeleteTreatment = (id) => apiRequest(`/treatments/${id}`, { method: 'DELETE' })
export const apiUpdateAdministration = (id, hour, data) => apiRequest(`/treatments/${id}/administrations/${hour}`, { method: 'PUT', body: JSON.stringify(data) })
export const apiCreateDiagnostic = (data) => apiRequest('/diagnostics', { method: 'POST', body: JSON.stringify(data) })
export const apiUpdateDiagnostic = (id, data) => apiRequest(`/diagnostics/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const apiDeleteDiagnostic = (id) => apiRequest(`/diagnostics/${id}`, { method: 'DELETE' })
