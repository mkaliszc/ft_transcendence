<template>
	<div id="app">
	  <!-- Navigation principale -->
	  <nav v-if="!isAuthRoute && !isGameRoute" class="main-nav">
		<div class="container mx-auto px-4 py-3 flex items-center justify-between">
		  <div class="flex items-center gap-2">
			<BillardBall :number="8" :size="36" />
			<span class="text-xl font-bold text-white">{{ $t('gameTitle') }}</span>
		  </div>
		  <div class="flex gap-4">
			<router-link to="/" class="nav-link">{{ $t('home') }}</router-link>
			<router-link v-if="isAuthenticated" to="/game" class="nav-link">{{ $t('play') }}</router-link>
			<router-link v-if="isAuthenticated" to="/profile" class="nav-link">{{ $t('profile') }}</router-link>
			<div v-if="!isAuthenticated" class="flex gap-2">
			  <router-link to="/signin" class="nav-link auth-link">{{ $t('signIn') }}</router-link>
			  <router-link to="/signup" class="nav-link auth-link signup">{{ $t('signUp') }}</router-link>
			</div>
			<button v-if="isAuthenticated" @click="logout" class="nav-link logout-btn">
			  {{ $t('logout') }}
			</button>
		  </div>
		  
		  <!-- Sélecteur de langue -->
		  <div class="language-switcher">
			<select v-model="$i18n.locale" @change="saveLanguagePreference" class="language-select">
			  <option value="en">🇺🇸 EN</option>
			  <option value="fr">🇫🇷 FR</option>
			  <option value="es">🇪🇸 ES</option>
			</select>
		  </div>
		</div>
	  </nav>
	  
	  <!-- Contenu principal -->
	  <router-view v-slot="{ Component }">
		<transition name="fade" mode="out-in">
		  <component :is="Component" />
		</transition>
	  </router-view>
	</div>
  </template>
  
  <script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import BillardBall from './components/BillardBall.vue'
  
  const route = useRoute()
  const router = useRouter()
  const { t, locale } = useI18n()
  
  // État d'authentification
  const isAuthenticated = ref(false)
  
  // Masquer la navigation sur certaines pages
  const isAuthRoute = computed(() => 
	route.path === '/signin' || 
	route.path === '/signup' || 
	route.path === '/register'
  )
  
		const isGameRoute = computed(() => route.path === '/' || route.path === '/Game' || route.path === '/profile' || route.path === '/gamemulti')
  
  // Charger la langue préférée
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
	locale.value = savedLanguage
  }
  
  // Sauvegarder la préférence de langue
  const saveLanguagePreference = () => {
	localStorage.setItem('preferred-language', locale.value)
  }
  
  // Vérifier l'état d'authentification
  const checkAuthStatus = () => {
	const token = localStorage.getItem('auth_token')
	isAuthenticated.value = !!token
  }
  
  // Déconnexion
  const logout = () => {
	localStorage.removeItem('auth_token')
	isAuthenticated.value = false
	router.push('/')
  }
  
  // Vérifier l'authentification au montage
  onMounted(() => {
	checkAuthStatus()
  })
  
  // Surveiller les changements de route pour mettre à jour l'état d'auth
  router.afterEach(() => {
	checkAuthStatus()
  })
  </script>
  
  <style>
  /* Styles globaux */
  * {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
  }
  
  html, body {
	font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	background-color: #0a0a0a;
	color: #ffffff;
	height: 100%;
  }
  
  #app {
	height: 100%;
	display: flex;
	flex-direction: column;
  }
  
  /* Navigation */
  .main-nav {
	background: linear-gradient(135deg, rgba(26, 71, 42, 0.9) 0%, rgba(45, 90, 61, 0.9) 50%, rgba(26, 71, 42, 0.9) 100%);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(212, 175, 55, 0.3);
	position: sticky;
	top: 0;
	z-index: 50;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .nav-link {
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.875rem;
	font-weight: 500;
	padding: 0.5rem 0.75rem;
	border-radius: 0.375rem;
	transition: all 0.2s ease;
	text-decoration: none;
	border: 1px solid transparent;
  }
  
  .nav-link:hover {
	color: #ffffff;
	background-color: rgba(212, 175, 55, 0.2);
	border-color: rgba(212, 175, 55, 0.3);
  }
  
  .router-link-active {
	color: #d4af37;
	font-weight: 600;
	background-color: rgba(212, 175, 55, 0.1);
	border-color: rgba(212, 175, 55, 0.3);
  }
  
  .auth-link {
	border: 1px solid rgba(212, 175, 55, 0.5);
  }
  
  .auth-link.signup {
	background-color: rgba(212, 175, 55, 0.1);
	color: #d4af37;
	font-weight: 600;
  }
  
  .auth-link.signup:hover {
	background-color: #d4af37;
	color: #1a1a1a;
  }
  
  .logout-btn {
	background-color: rgba(220, 53, 69, 0.1);
	border: 1px solid rgba(220, 53, 69, 0.5);
	color: #ff6b6b;
  }
  
  .logout-btn:hover {
	background-color: rgba(220, 53, 69, 0.2);
	color: #ffffff;
  }
  
  /* Sélecteur de langue */
  .language-switcher {
	margin-left: 1rem;
  }
  
  .language-select {
	padding: 0.375rem 0.75rem;
	border: 1px solid rgba(212, 175, 55, 0.5);
	border-radius: 0.375rem;
	background-color: rgba(0, 0, 0, 0.3);
	color: #ffffff;
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
  }
  
  .language-select:focus {
	outline: none;
	border-color: #d4af37;
	box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
  }
  
  .language-select:hover {
	background-color: rgba(212, 175, 55, 0.1);
  }
  
  /* Transitions entre les pages */
  .fade-enter-active,
  .fade-leave-active {
	transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
	opacity: 0;
  }
  
  /* Classes utilitaires */
  .container {
	width: 100%;
	max-width: 1280px;
	margin: 0 auto;
  }
  
  .flex {
	display: flex;
  }
  
  .flex-col {
	flex-direction: column;
  }
  
  .items-center {
	align-items: center;
  }
  
  .justify-between {
	justify-content: space-between;
  }
  
  .justify-center {
	justify-content: center;
  }
  
  .gap-2 {
	gap: 0.5rem;
  }
  
  .gap-4 {
	gap: 1rem;
  }
  
  .px-4 {
	padding-left: 1rem;
	padding-right: 1rem;
  }
  
  .py-3 {
	padding-top: 0.75rem;
	padding-bottom: 0.75rem;
  }
  
  .text-xl {
	font-size: 1.25rem;
	line-height: 1.75rem;
  }
  
  .font-bold {
	font-weight: 700;
  }
  
  .text-white {
	color: #ffffff;
  }
  
  .min-h-screen {
	min-height: 100vh;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
	.main-nav .container {
	  flex-direction: column;
	  gap: 1rem;
	}
	
	.main-nav .flex {
	  flex-wrap: wrap;
	  justify-content: center;
	}
	
	.language-switcher {
	  margin-left: 0;
	}
  }
  </style>