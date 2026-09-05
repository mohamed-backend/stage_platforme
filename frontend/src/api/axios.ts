import axios from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store'
import { formatApiError } from '@/utils'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }

  const contentType = config.headers['Content-Type'] as string | undefined
  if (contentType?.includes('multipart/form-data')) {
    config.timeout = 30000
  }

  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && !originalRequest._retry) {
      const tokens = useAuthStore.getState().tokens

      if (!tokens?.refresh) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/token/refresh/`,
          { refresh: tokens.refresh }
        )

        const newTokens = { access: data.access, refresh: data.refresh || tokens.refresh }
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, newTokens)
        }

        originalRequest.headers.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 400) {
      toast.error(formatApiError(error, 'Requête invalide. Veuillez vérifier vos informations.'))
    } else if (status === 403) {
      toast.error('Vous n\'avez pas la permission d\'effectuer cette action.')
    } else if (status === 404) {
      toast.error(formatApiError(error, 'Ressource introuvable.'))
    } else if (status && status >= 500) {
      toast.error('A server error occurred. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export default api
