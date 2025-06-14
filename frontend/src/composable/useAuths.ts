"use client"

import { ref, computed } from "vue"
import { authApi } from "../services/authAPI"

const user = ref(null)
const token = ref(localStorage.getItem("auth_token"))
const refreshToken = ref(localStorage.getItem("refresh_token"))
const loading = ref(false)
const error = ref("")

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  const register = async (userData: { username: string; email_adress: string; password: string }) => {
    loading.value = true
    error.value = ""

    try {
      const response = await authApi.register(userData)
      return response
    } catch (err: any) {
      error.value = err.message || "Erreur d'inscription"
      throw err
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    loading.value = true
    error.value = ""

    try {
      const response = await authApi.login(credentials)

      if (response.token || response.accessToken) {
        const authToken = response.token || response.accessToken
        token.value = authToken
        localStorage.setItem("auth_token", authToken)
      }

      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
        localStorage.setItem("refresh_token", response.refreshToken)
      }

      if (response.user) {
        user.value = response.user
        localStorage.setItem("user_data", JSON.stringify(response.user))
      }

      return response
    } catch (err: any) {
      error.value = err.message || "Erreur de connexion"
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    localStorage.removeItem("remember_me")
    localStorage.removeItem("user_email")
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      throw new Error("Aucun token de rafraîchissement disponible")
    }

    loading.value = true
    error.value = ""

    try {
      const response = await authApi.refreshToken(refreshToken.value)

      if (response.token || response.accessToken) {
        const newToken = response.token || response.accessToken
        token.value = newToken
        localStorage.setItem("auth_token", newToken)
      }

      return response
    } catch (err: any) {
      error.value = err.message || "Erreur de rafraîchissement du token"
      logout() // Déconnecter l'utilisateur si le refresh échoue
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = () => {
    const savedUser = localStorage.getItem("user_data")
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("user_data")
      }
    }
  }

  const clearError = () => {
    error.value = ""
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    isLoading,
    error: computed(() => error.value),
    hasError,
    login,
    logout,
    refreshAuthToken,
    initializeAuth,
    clearError,
    register,
  }
}
