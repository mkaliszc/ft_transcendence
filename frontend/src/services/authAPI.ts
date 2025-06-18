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
		throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
	  }
  
	  // Vérifier si la réponse est vide
	  const contentType = response.headers.get("content-type")
	  if (contentType && contentType.includes("application/json")) {
		return await response.json()
	  }
  
	  return {}
	} catch (error: any) {
	  console.error("API request error:", error)
	  throw error
	}
  }
  
  // Fonctions d'authentification
  export const authApi = {
	// Inscription
	register: async (userData: Record<string, any>) => {
	  try {
		return await fetchApi("/auth/register", {
		  method: "POST",
		  body: JSON.stringify(userData),
		})
	  } catch (error) {
		throw error
	  }
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
	  // Utiliser le token temporaire pour la vérification 2FA
	  const tempToken = localStorage.getItem('temp_2fa_token')
	  console.log('🔵 check2FA called with code:', code)
	  console.log('🔵 Temp token found:', !!tempToken)
	  console.log('🔵 Temp token value:', tempToken ? tempToken.substring(0, 20) + '...' : 'null')
	  
	  const response = await fetchApi("/auth/check2FA", {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		  ...(tempToken ? { Authorization: `Bearer ${tempToken}` } : {}),
		},
		body: JSON.stringify({ code }),
	  })
	  
	  console.log('🔵 check2FA response:', response)
	  return response
	},
  
	// Désactiver 2FA
	disable2FA: async (code: string) => {
	  return fetchApi("/auth/disable2FA", {
		method: "POST",
		body: JSON.stringify({ code }),
	  })
	},
  }
