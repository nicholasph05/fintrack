const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  transactions: `${API_BASE_URL}/api/transactions`,
  budgets: `${API_BASE_URL}/api/budgets`,
  savingsGoals: `${API_BASE_URL}/api/savings-goals`,
}

