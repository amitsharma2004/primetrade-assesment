import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Login failed')
          }

          const data = await response.json()
          
          const userData = {
            id: data.data.user._id,
            name: data.data.user.name,
            email: data.data.user.email
          };
          
          set({
            user: userData,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (name: string, email: string, password: string, confirmPassword: string) => {
        set({ isLoading: true })
        try {
          const requestBody = { 
            name, 
            email, 
            password, 
            confirmPassword
          };
          
          const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Registration failed')
          }

          const data = await response.json()
          
          const userData = {
            id: data.data.user._id,
            name: data.data.user.name,
            email: data.data.user.email
          };
          
          set({
            user: userData,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)