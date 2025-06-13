// Fonction utilitaire pour les requêtes fetch
const fetchApi = async (url: string, options: RequestInit = {}) => {
	// Récupérer le token d'authentification
	const token = localStorage.getItem("auth_token")
  
	// Préparer les headers avec le token
	const headers = {
	  "Content-Type": "application/json",
	  ...(token ? { Authorization: `Bearer ${token}` } : {}),
	  ...options.headers,
	}
  
	try {
	  // Effectuer la requête
	  const response = await fetch(`/api${url}`, {
		...options,
		headers,
	  })
  
	  // Vérifier si la réponse est OK
	  if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
	  }
  
	  // Vérifier si la réponse est vide
	  const contentType = response.headers.get("content-type")
	  if (contentType && contentType.includes("application/json")) {
		return await response.json()
	  }
  
	  return {}
	} catch (error) {
	  console.error("API request error:", error)
	  throw error
	}
  }
  
  // Fonctions d'authentification
  export const authApi = {
	// Inscription
	register: async (userData: Record<string, any>) => {
	  return fetchApi("/auth/register", {
		method: "POST",
		body: JSON.stringify(userData),
	  })
	},
  
	// Connexion
	login: async (credentials: Record<string, any>) => {
	  return fetchApi("/auth", {
		method: "POST",
		body: JSON.stringify(credentials),
	  })
	},
  
	// Rafraîchir le token
	refreshToken: async (refreshToken: string) => {
	  return fetchApi("/auth/refreshtoken", {
		method: "POST",
		body: JSON.stringify({ refreshToken }),
	  })
	},
  
	// Activer 2FA
	enable2FA: async () => {
	  return fetchApi("/auth/enable2FA")
	},
  
	// Vérifier 2FA
	check2FA: async (code: string) => {
	  return fetchApi("/auth/check2FA", {
		method: "POST",
		body: JSON.stringify({ code }),
	  })
	},
  
	// Désactiver 2FA
	disable2FA: async (code: string) => {
	  return fetchApi("/auth/disable2FA", {
		method: "POST",
		body: JSON.stringify({ code }),
	  })
	},
  }
  