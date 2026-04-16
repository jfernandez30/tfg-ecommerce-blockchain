const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const getToken = () => localStorage.getItem('token')

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
})

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, { headers: headers() })
    return res.json()
  },
  post: async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    })
    return res.json()
  },
  put: async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body)
    })
    return res.json()
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: headers()
    })
    return res.json()
  }
}
