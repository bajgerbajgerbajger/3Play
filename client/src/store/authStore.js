import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            set({ isLoading: false })
            return
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')

          set({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          delete api.defaults.headers.common['Authorization']
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, accessToken, refreshToken } = response.data.data

          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({
            isLoading: false,
            error: message
          })
          return { success: false, message }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', { name, email, password })
          const { user, accessToken, refreshToken } = response.data.data

          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return { success: true }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({
            isLoading: false,
            error: message
          })
          return { success: false, message }
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          await api.post('/auth/logout', { refreshToken })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          delete api.defaults.headers.common['Authorization']
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      logoutAll: async () => {
        try {
          await api.post('/auth/logout-all')
        } catch (error) {
          console.error('Logout all error:', error)
        } finally {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          delete api.defaults.headers.common['Authorization']
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      clearError: () => set({ error: null })
    }),
    {
      name: '3play-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
