import api from './axios'
import type { AuthTokens, LoginCredentials, RegisterData, User } from '@/types'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthTokens>('/auth/token/', credentials),

  register: (data: RegisterData) =>
    api.post<User>('/users/register/', data),

  refreshToken: (refresh: string) =>
    api.post<{ access: string; refresh?: string }>('/auth/token/refresh/', { refresh }),

  getProfile: () =>
    api.get<User>('/users/me/'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/users/me/', data),

  logout: (refresh: string) =>
    api.post('/users/logout/', { refresh }),

  forgotPassword: (email: string) =>
    api.post('/users/password-reset/', { email }),

  resetPassword: (uid: string, token: string, new_password: string, confirm_password: string) =>
    api.post('/users/password-reset/confirm/', { uid, token, new_password, confirm_password }),

  submitKyc: (formData: FormData) =>
    api.post('/users/kyc/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }),

  getKyc: () =>
    api.get('/users/kyc/'),
}
