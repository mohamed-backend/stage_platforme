import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/store'
import type { LoginCredentials, RegisterData } from '@/types'

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthStore()
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await authApi.getProfile()
      setUser(data)
      return data
    },
    enabled: isAuthenticated,
    retry: false,
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials)
      const tokens = response.data
      useAuthStore.setState({ tokens, isAuthenticated: true })
      try {
        const { data: user } = await authApi.getProfile()
        setAuth(user, tokens)
        return { user, tokens }
      } catch (err) {
        useAuthStore.getState().logout()
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data.email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { uid: string; token: string; new_password: string; confirm_password: string }) =>
      authApi.resetPassword(data.uid, data.token, data.new_password, data.confirm_password),
  })
}

export function useKyc() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['kyc'],
    queryFn: async () => {
      try {
        const { data } = await authApi.getKyc()
        return data
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 404) return null
        throw e
      }
    },
    enabled: isAuthenticated,
  })
}
