import axios from "axios"

// Création du client API
const apiClient = axios.create({
  baseURL: "/api", // Nginx redirige /api/ vers votre backend
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token aux requêtes
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem("auth_token")
      // Vous pouvez rediriger vers la page de connexion ici
    }
    return Promise.reject(error)
  },
)

// Fonctions d'authentification
export const authApi = {
  // Inscription
  register: async (userData: Record<string, any>) => {
    const response = await apiClient.post("/auth/register", userData)
    return response.data
  },

  // Connexion
  login: async (credentials: Record<string, any>) => {
    const response = await apiClient.post("/auth", credentials)
    return response.data
  },

  // Rafraîchir le token
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post("/auth/refreshtoken", { refreshToken })
    return response.data
  },

  // Activer 2FA
  enable2FA: async () => {
    const response = await apiClient.get("/auth/enable2FA")
    return response.data
  },

  // Vérifier 2FA
  check2FA: async (code: string) => {
    const response = await apiClient.post("/auth/check2FA", { code })
    return response.data
  },

  // Désactiver 2FA
  disable2FA: async (code: string) => {
    const response = await apiClient.post("/auth/disable2FA", { code })
    return response.data
  },
}

export default apiClient
