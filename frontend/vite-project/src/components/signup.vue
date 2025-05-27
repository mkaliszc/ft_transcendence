<template>
	<div class="signup-container">
	  <!-- Header avec retour et langue -->
	  <header class="header">
		<button @click="goBack" class="back-button">
		  <svg class="back-icon" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path>
		  </svg>
		  {{ $t('backToHome') }}
		</button>
		
		<div class="language-switcher-header">
		  <select v-model="$i18n.locale" @change="saveLanguagePreference" class="language-select">
			<option value="en">🇺🇸 English</option>
			<option value="fr">🇫🇷 Français</option>
			<option value="es">🇪🇸 Español</option>
		  </select>
		</div>
	  </header>
  
	  <!-- Contenu principal -->
	  <main class="signup-main">
		<div class="signup-content">
		  <!-- Logo et titre -->
		  <div class="logo-container">
			<div class="billiard-ball ball-8"></div>
			<h1 class="title">{{ $t('signUpTitle') }}</h1>
			<p class="subtitle">{{ $t('signUpSubtitle') }}</p>
		  </div>
		  
		  <!-- Messages d'erreur -->
		  <div v-if="error" class="error-message">
			{{ error }}
		  </div>
		  
		  <!-- Formulaire d'inscription -->
		  <form @submit.prevent="handleSignUp" class="signup-form">
			<div class="form-row">
			  <div class="form-group">
				<label for="firstName">{{ $t('firstName') }}</label>
				<input 
				  id="firstName"
				  v-model="form.firstName"
				  type="text"
				  required
				  :placeholder="$t('firstNamePlaceholder')"
				  class="form-input"
				  :disabled="loading"
				/>
			  </div>
			  
			  <div class="form-group">
				<label for="lastName">{{ $t('lastName') }}</label>
				<input 
				  id="lastName"
				  v-model="form.lastName"
				  type="text"
				  required
				  :placeholder="$t('lastNamePlaceholder')"
				  class="form-input"
				  :disabled="loading"
				/>
			  </div>
			</div>
			
			<div class="form-group">
			  <label for="email">{{ $t('email') }}</label>
			  <input 
				id="email"
				v-model="form.email"
				type="email"
				required
				:placeholder="$t('emailPlaceholder')"
				class="form-input"
				:disabled="loading"
			  />
			</div>
			
			<div class="form-group">
			  <label for="password">{{ $t('password') }}</label>
			  <div class="password-input-container">
				<input
				  id="password"
				  v-model="form.password"
				  :type="showPassword ? 'text' : 'password'"
				  required
				  :placeholder="$t('passwordPlaceholder')"
				  class="form-input"
				  :disabled="loading"
				  @input="checkPasswordStrength"
				/>
				<button 
				  type="button" 
				  @click="togglePassword" 
				  class="password-toggle"
				  :disabled="loading"
				>
				  <svg v-if="showPassword" class="eye-icon" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path>
					<path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path>
				  </svg>
				  <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 20 20">
					<path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
					<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
				  </svg>
				</button>
			  </div>
			  <!-- Indicateur de force du mot de passe -->
			  <div v-if="form.password" class="password-strength">
				<div class="strength-bar">
				  <div 
					class="strength-fill" 
					:class="passwordStrength.class"
					:style="{ width: passwordStrength.width }"
				  ></div>
				</div>
				<span class="strength-text" :class="passwordStrength.class">
				  {{ passwordStrength.text }}
				</span>
			  </div>
			</div>
			
			<div class="form-group">
			  <label for="confirmPassword">{{ $t('confirmPassword') }}</label>
			  <input
				id="confirmPassword"
				v-model="form.confirmPassword"
				type="password"
				required
				:placeholder="$t('confirmPasswordPlaceholder')"
				class="form-input"
				:disabled="loading"
			  />
			  <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="password-mismatch">
				{{ $t('passwordMismatch') }}
			  </div>
			</div>
  
			<div class="form-group">
			  <label class="terms-checkbox">
				<input type="checkbox" v-model="form.acceptTerms" required :disabled="loading">
				<span class="checkmark"></span>
				<span class="terms-text">
				  {{ $t('acceptTerms') }} 
				  <a href="#" class="link" @click.prevent="showTerms">{{ $t('termsOfService') }}</a>
				  {{ $t('and') }}
				  <a href="#" class="link" @click.prevent="showPrivacy">{{ $t('privacyPolicy') }}</a>
				</span>
			  </label>
			</div>
			
			<button type="submit" class="signup-button" :disabled="loading || !isFormValid">
			  <svg v-if="loading" class="loading-spinner" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			  </svg>
			  {{ loading ? $t('creatingAccount') : $t('createAccount') }}
			</button>
  
			<!-- Divider -->
			<div class="divider">
			  <span>{{ $t('orContinueWith') }}</span>
			</div>
  
			<!-- Bouton Google -->
			<button @click="handleGoogleSignUp" type="button" class="google-signup-button" :disabled="loading">
			  <svg class="google-icon" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			  </svg>
			  {{ $t('googleSignUp') }}
			</button>
		  </form>
		  
		  <!-- Lien vers connexion -->
		  <p class="signin-link">
			{{ $t('alreadyHaveAccount') }} 
			<a href="#" @click.prevent="goToSignIn" class="link">{{ $t('signIn') }}</a>
		  </p>
		</div>
  
		<!-- Décoration avec boules de billard -->
		<div class="billiard-decoration">
		  <div class="billiard-ball ball-1 floating" style="top: 10%; left: 5%;"></div>
		  <div class="billiard-ball ball-2 floating" style="top: 20%; right: 8%;"></div>
		  <div class="billiard-ball ball-3 floating" style="top: 60%; left: 3%;"></div>
		  <div class="billiard-ball ball-4 floating" style="top: 70%; right: 5%;"></div>
		  <div class="billiard-ball ball-5 floating" style="top: 40%; left: 2%;"></div>
		</div>
	  </main>
	</div>
  </template>
  
  <script setup>
   import { useRouter } from 'vue-router'
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  
  
  // Utilisation de vue-i18n
  const { t, locale } = useI18n()
  
  // Props et émissions
  const emit = defineEmits(['signup-success', 'go-to-signin', 'go-to-home'])
  
  // États réactifs
  const form = ref({
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
	acceptTerms: false
  })
  const loading = ref(false)
  const error = ref('')
  const showPassword = ref(false)
  const passwordStrength = ref({ width: '0%', class: '', text: '' })
  
  // Charger la langue préférée
  const savedLanguage = localStorage.getItem('preferred-language')
  if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
	locale.value = savedLanguage
  }
  
  // Computed
  const isFormValid = computed(() => {
	return form.value.firstName &&
		   form.value.lastName &&
		   form.value.email &&
		   form.value.password &&
		   form.value.confirmPassword &&
		   form.value.password === form.value.confirmPassword &&
		   form.value.acceptTerms &&
		   form.value.password.length >= 8
  })
  
  // Méthodes
  const saveLanguagePreference = () => {
	localStorage.setItem('preferred-language', locale.value)
  }
  
  const togglePassword = () => {
	showPassword.value = !showPassword.value
  }
  
  const checkPasswordStrength = () => {
	const password = form.value.password
	let score = 0
	
	if (password.length >= 8) score++
	if (/[a-z]/.test(password)) score++
	if (/[A-Z]/.test(password)) score++
	if (/[0-9]/.test(password)) score++
	if (/[^A-Za-z0-9]/.test(password)) score++
	
	if (score <= 2) {
	  passwordStrength.value = { width: '33%', class: 'weak', text: t('passwordWeak') }
	} else if (score <= 3) {
	  passwordStrength.value = { width: '66%', class: 'medium', text: t('passwordMedium') }
	} else {
	  passwordStrength.value = { width: '100%', class: 'strong', text: t('passwordStrong') }
	}
  }
  
  const handleSignUp = async () => {
	error.value = ''
	loading.value = true
	
	try {
	  // Simulation d'appel API
	  await new Promise(resolve => setTimeout(resolve, 2000))
	  
	  const userData = {
		id: Date.now(),
		email: form.value.email,
		firstName: form.value.firstName,
		lastName: form.value.lastName,
		avatar: null
	  }
	  
	  // Sauvegarder le token
	  localStorage.setItem('auth_token', `token-${userData.id}`)
	  
	  emit('signup-success', userData)
	} catch (err) {
	  error.value = err.message || t('signupError')
	} finally {
	  loading.value = false
	}
  }
  
  const handleGoogleSignUp = () => {
	console.log('Google Sign Up')
	alert(t('googleSignUpNotImplemented'))
  }
  
  const showTerms = () => {
	alert(t('termsNotImplemented'))
  }
  
  const showPrivacy = () => {
	alert(t('privacyNotImplemented'))
  }
  
  const goToSignIn = () => {
	emit('go-to-signin')
  }
  
  const goBack = () => {
  	emit('/')
}
  </script>
  
  <style scoped>
  /* Réutilisation des styles de sign-in avec quelques modifications */
  .signup-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
	color: #f8f9fa;
	position: relative;
	overflow-x: hidden;
  }
  
  .header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(10px);
  }
  
  .back-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background: none;
	border: none;
	color: #d4af37;
	cursor: pointer;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	transition: all 0.2s ease;
	font-weight: 500;
  }
  
  .back-button:hover {
	background: rgba(212, 175, 55, 0.2);
  }
  
  .back-icon {
	width: 20px;
	height: 20px;
  }
  
  .language-select {
	padding: 0.5rem 1rem;
	border: 2px solid #d4af37;
	border-radius: 0.5rem;
	background-color: rgba(255, 255, 255, 0.9);
	color: #1a1a1a;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
  }
  
  .signup-main {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 80px);
	padding: 2rem;
	position: relative;
  }
  
  .signup-content {
	background: rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(15px);
	border: 1px solid rgba(212, 175, 55, 0.3);
	border-radius: 1.5rem;
	padding: 3rem;
	max-width: 500px;
	width: 100%;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
	z-index: 2;
  }
  
  .logo-container {
	text-align: center;
	margin-bottom: 2rem;
  }
  
  .ball-8 {
	width: 60px;
	height: 60px;
	background-color: #000;
	border-radius: 50%;
	position: relative;
	margin: 0 auto 1.5rem;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .ball-8::after {
	content: "8";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: white;
	font-weight: bold;
	font-size: 24px;
  }
  
  .title {
	font-size: 2rem;
	font-weight: bold;
	color: #d4af37;
	margin-bottom: 0.5rem;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
  
  .subtitle {
	color: #e0e0e0;
	margin-bottom: 0;
  }
  
  .error-message {
	padding: 0.75rem;
	margin-bottom: 1.5rem;
	background-color: rgba(220, 53, 69, 0.8);
	color: white;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	border-left: 4px solid #dc3545;
  }
  
  .signup-form {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
  }
  
  .form-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
  }
  
  .form-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
  }
  
  label {
	font-weight: 500;
	color: #e0e0e0;
  }
  
  .form-input {
	padding: 0.875rem;
	border: 2px solid rgba(212, 175, 55, 0.3);
	border-radius: 0.5rem;
	font-size: 1rem;
	background-color: rgba(255, 255, 255, 0.1);
	color: #f8f9fa;
	transition: all 0.2s ease-in-out;
  }
  
  .form-input:focus {
	outline: none;
	border-color: #d4af37;
	box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
	background-color: rgba(255, 255, 255, 0.15);
  }
  
  .form-input::placeholder {
	color: rgba(248, 249, 250, 0.6);
  }
  
  .password-input-container {
	position: relative;
  }
  
  .password-toggle {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: #d4af37;
	cursor: pointer;
	padding: 0.25rem;
  }
  
  .eye-icon {
	width: 20px;
	height: 20px;
  }
  
  .password-strength {
	margin-top: 0.5rem;
  }
  
  .strength-bar {
	width: 100%;
	height: 4px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 2px;
	overflow: hidden;
  }
  
  .strength-fill {
	height: 100%;
	transition: width 0.3s ease;
  }
  
  .strength-fill.weak {
	background: #f44336;
  }
  
  .strength-fill.medium {
	background: #ff9800;
  }
  
  .strength-fill.strong {
	background: #4caf50;
  }
  
  .strength-text {
	font-size: 0.75rem;
	margin-top: 0.25rem;
	display: block;
  }
  
  .strength-text.weak {
	color: #f44336;
  }
  
  .strength-text.medium {
	color: #ff9800;
  }
  
  .strength-text.strong {
	color: #4caf50;
  }
  
  .password-mismatch {
	color: #f44336;
	font-size: 0.75rem;
	margin-top: 0.25rem;
  }
  
  .terms-checkbox {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	cursor: pointer;
	color: #e0e0e0;
	font-size: 0.875rem;
	line-height: 1.4;
  }
  
  .terms-checkbox input[type="checkbox"] {
	display: none;
  }
  
  .checkmark {
	width: 18px;
	height: 18px;
	border: 2px solid #d4af37;
	border-radius: 3px;
	position: relative;
	transition: all 0.2s ease;
	flex-shrink: 0;
	margin-top: 2px;
  }
  
  .terms-checkbox input[type="checkbox"]:checked + .checkmark {
	background-color: #d4af37;
  }
  
  .terms-checkbox input[type="checkbox"]:checked + .checkmark::after {
	content: "✓";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: #1a1a1a;
	font-size: 12px;
	font-weight: bold;
  }
  
  .terms-text {
	flex: 1;
  }
  
  .signup-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1rem;
	background: linear-gradient(135deg, #d4af37, #c19b2e);
	color: #1a1a1a;
	border: none;
	border-radius: 0.5rem;
	font-size: 1.125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	text-transform: uppercase;
	letter-spacing: 1px;
  }
  
  .signup-button:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
  }
  
  .signup-button:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	transform: none;
  }
  
  .loading-spinner {
	width: 20px;
	height: 20px;
	animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
  }
  
  .divider {
	text-align: center;
	position: relative;
	margin: 1rem 0;
  }
  
  .divider::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 0;
	right: 0;
	height: 1px;
	background: rgba(212, 175, 55, 0.3);
  }
  
  .divider span {
	background: rgba(0, 0, 0, 0.4);
	padding: 0 1rem;
	color: #e0e0e0;
	font-size: 0.875rem;
  }
  
  .google-signup-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 1rem;
	background: rgba(255, 255, 255, 0.1);
	color: #f8f9fa;
	border: 2px solid rgba(255, 255, 255, 0.2);
	border-radius: 0.5rem;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
  }
  
  .google-signup-button:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.2);
	border-color: rgba(255, 255, 255, 0.3);
  }
  
  .google-icon {
	width: 20px;
	height: 20px;
  }
  
  .signin-link {
	text-align: center;
	margin-top: 2rem;
	color: #e0e0e0;
	font-size: 0.875rem;
  }
  
  .link {
	color: #d4af37;
	text-decoration: none;
	font-weight: 600;
	transition: color 0.2s ease;
  }
  
  .link:hover {
	color: #c19b2e;
	text-decoration: underline;
  }
  
  .billiard-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	z-index: 1;
  }
  
  .billiard-ball {
	position: absolute;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .ball-1 { background-color: #ffeb3b; }
  .ball-2 { background-color: #2196f3; }
  .ball-3 { background-color: #f44336; }
  .ball-4 { background-color: #9c27b0; }
  .ball-5 { background-color: #ff9800; }
  
  .floating {
	animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
	0%, 100% { transform: translateY(0px) rotate(0deg); }
	50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  /* Responsive */
  @media (max-width: 768px) {
	.header {
	  flex-direction: column;
	  gap: 1rem;
	}
	
	.signup-content {
	  padding: 2rem;
	  margin: 1rem;
	}
	
	.title {
	  font-size: 1.75rem;
	}
	
	.form-row {
	  grid-template-columns: 1fr;
	}
	
	.terms-checkbox {
	  align-items: flex-start;
	}
  }
  </style>