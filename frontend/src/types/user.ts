export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  is_active?: boolean
  is_verified?: boolean
  kyc_status?: string
  role?: UserRole
  date_joined?: string
  last_login?: string
}

export type UserRole = 'INVESTOR' | 'PROJECT_OWNER' | 'INSURER' | 'ADMIN'

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: 'INVESTOR' | 'PROJECT_OWNER'
}
