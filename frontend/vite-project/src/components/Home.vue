<template>
	<div class="home-container">
	  <!-- Header avec sélecteur de langue -->
	  <header class="header">
		<div class="logo-section">
		  <div class="billiard-ball ball-8-small"></div>
		  <h1 class="logo-text">{{ $t('gameTitle') }}</h1>
		</div>
		
		<div class="language-switcher-header">
		  <select v-model="$i18n.locale" @change="saveLanguagePreference" class="language-select">
			<option value="en">🇺🇸 English</option>
			<option value="fr">🇫🇷 Français</option>
			<option value="es">🇪🇸 Español</option>
		  </select>
		</div>
	  </header>
  
	  <!-- Section Hero -->
	  <main class="hero-section">
		  <div class="title-container">
			<h1 class="main-title">{{ $t('welcomeTitle') }}</h1>
		  </div>
  
		  <!-- Animation de la table de pong -->
		  <div class="pong-table-container">
			<div class="pong-table">
			  <div class="table-surface">
				<div class="center-line"></div>
				<div class="paddle paddle-left" :style="{ top: leftPaddleY + 'px' }"></div>
				<div class="paddle paddle-right" :style="{ top: rightPaddleY + 'px' }"></div>
				<div class="ball" :style="{ left: ballX + 'px', top: ballY + 'px' }"></div>
			  </div>
			</div>
		  </div>
  
		  <!-- Boutons d'action -->
		  <div class="action-buttons">
			<button @click="goToSignIn" class="btn btn-primary">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"></path>
			  </svg>
			  {{ $t('signIn') }}
			</button>
			
			<button @click="goToSignUp" class="btn btn-secondary">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
			  </svg>
			  {{ $t('signUp') }}
			</button>
		  </div>
  
		  <!-- Fonctionnalités du jeu -->
<!-- Fonctionnalités du jeu transformées en boutons cliquables -->
		<div class="features-buttons">
		  <button @click="goToFeature1" class="feature-button">
		    <div class="feature-icon">🏓</div>
		    <h3>{{ $t('feature1Title') }}</h3>
		    <p>{{ $t('feature1Description') }}</p>
		    <div class="button-arrow">→</div>
		  </button>

		  <button @click="goToFeature2" class="feature-button">
		    <div class="feature-icon">🎯</div>
		    <h3>{{ $t('feature2Title') }}</h3>
		    <p>{{ $t('feature2Description') }}</p>
		    <div class="button-arrow">→</div>
		  </button>

		  <button @click="goToFeature3" class="feature-button">
		    <div class="feature-icon">🏆</div>
		    <h3>{{ $t('feature3Title') }}</h3>
		    <p>{{ $t('feature3Description') }}</p>
		    <div class="button-arrow">→</div>
		  </button>
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
  
	  <!-- Footer -->
	  <footer class="footer">
	  </footer>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  const router = useRouter();
  
  // Utilisation de vue-i18n
  const { t, locale } = useI18n()
  
  // Charger la langue préférée
  const savedLanguage = localStorage.getItem('preferred-language')
  const initialLocale = savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage) ? savedLanguage : null;
  if (initialLocale) {
	locale.value = initialLocale;
  }
  
  // Variables pour l'animation du pong
  const ballX = ref(200)
  const ballY = ref(100)
  const ballSpeedX = ref(2)
  const ballSpeedY = ref(1.5)
  const leftPaddleY = ref(80)
  const rightPaddleY = ref(80)
  let animationId = null
  
  // Sauvegarder la préférence de langue
  const saveLanguagePreference = () => {
	localStorage.setItem('preferred-language', locale.value)
  }
  
  // Animation du jeu de pong
  const animatePong = () => {
	// Mouvement de la balle
	ballX.value += ballSpeedX.value
	ballY.value += ballSpeedY.value
  
	// Rebond sur les murs haut et bas
	if (ballY.value <= 0 || ballY.value >= 180) {
	  ballSpeedY.value = -ballSpeedY.value
	}
  
	// Rebond sur les raquettes ou reset
	if (ballX.value <= 20) {
	  if (ballY.value >= leftPaddleY.value && ballY.value <= leftPaddleY.value + 60) {
		ballSpeedX.value = -ballSpeedX.value
	  } else {
		// Reset la balle
		ballX.value = 200
		ballY.value = 100
		ballSpeedX.value = 2
	  }
	}
  
	if (ballX.value >= 380) {
	  if (ballY.value >= rightPaddleY.value && ballY.value <= rightPaddleY.value + 60) {
		ballSpeedX.value = -ballSpeedX.value
	  } else {
		// Reset la balle
		ballX.value = 200
		ballY.value = 100
		ballSpeedX.value = -2
	  }
	}
  
	// Mouvement automatique des raquettes (IA simple)
	if (leftPaddleY.value + 30 < ballY.value) leftPaddleY.value += 1
	if (leftPaddleY.value + 30 > ballY.value) leftPaddleY.value -= 1
	
	if (rightPaddleY.value + 30 < ballY.value) rightPaddleY.value += 1
	if (rightPaddleY.value + 30 > ballY.value) rightPaddleY.value -= 1
  
	animationId = requestAnimationFrame(animatePong)
  }
  
  // Navigation
  const goToSignIn = () => {
	console.log('Navigate to Sign In')
	// Ici vous pourriez utiliser Vue Router pour naviguer
	window.location.assign('/signin')
	// alert(t('redirectingToSignIn'))
  }
  
  const goToSignUp = () => {
	console.log('Navigate to Sign Up')
	// Ici vous pourriez utiliser Vue Router pour naviguer
	window.location.assign('/signup')
	// alert(t('redirectingToSignUp'))
  }
  
  // Lifecycle hooks
  onMounted(() => {
	animatePong()
  })
  
  onUnmounted(() => {
	if (animationId) {
	  cancelAnimationFrame(animationId)
	}
  })

  // Nouvelles fonctions pour les boutons de fonctionnalités
	const goToFeature1 = () => {
	  console.log('Navigate to Feature 1 - Gameplay')
	  window.location.assign('/Game')
	}

	const goToFeature2 = () => {
	  console.log('Navigate to Feature 2 - profile')
	  window.location.assign('/profile')
	}

	const goToFeature3 = () => {
	  console.log('Navigate to Feature 3 - Tournaments')
	  window.location.assign('/tournament')
	}

  </script>
  
  <style scoped>
  .home-container {
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
  
  .logo-section {
	display: flex;
	align-items: center;
	gap: 1rem;
  }
  
  .logo-text {
	font-size: 1.5rem;
	font-weight: bold;
	color: #d4af37;
	margin: 0;
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
  
  .language-select:focus {
	outline: none;
	box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
  }
  
  .hero-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 120px);
	padding: 2rem;
	position: relative;
  }
  
  .hero-content {
	text-align: center;
	max-width: 800px;
	z-index: 2;
  }
  
  .title-container {
	margin-bottom: 3rem;
  }
  
  .main-title {
	font-size: 3.5rem;
	font-weight: bold;
	color: #d4af37;
	margin-bottom: 1rem;
	text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	font-family: 'Georgia', serif;
  }
  
  .subtitle {
	font-size: 1.25rem;
	color: #e0e0e0;
	margin-bottom: 2rem;
	line-height: 1.6;
  }
  
  /* CORRECTION DU CENTRAGE DE LA TABLE */
  .pong-table-container {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin: 2rem 0;
  }
  
  .pong-table {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1rem;
	background: #5d4037;
	border-radius: 1rem;
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
	width: fit-content;
  }
  
  .table-surface {
	width: 400px;
	height: 200px;
	background: #1a472a;
	border: 4px solid #d4af37;
	border-radius: 0.5rem;
	position: relative;
	overflow: hidden;
  }
  
  .center-line {
	position: absolute;
	left: 50%;
	top: 0;
	bottom: 0;
	width: 2px;
	background: #d4af37;
	transform: translateX(-50%);
  }
  
  .paddle {
	position: absolute;
	width: 8px;
	height: 60px;
	background: #d4af37;
	border-radius: 4px;
  }
  
  .paddle-left {
	left: 10px;
  }
  
  .paddle-right {
	right: 10px;
  }
  
  .ball {
	position: absolute;
	width: 12px;
	height: 12px;
	background: #fff;
	border-radius: 50%;
	box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  .action-buttons {
	display: flex;
	gap: 1.5rem;
	justify-content: center;
	margin: 3rem 0;
	flex-wrap: wrap;
  }
  
  .btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 1rem 2rem;
	border: none;
	border-radius: 0.75rem;
	font-size: 1.125rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	text-transform: uppercase;
	letter-spacing: 1px;
	min-width: 160px;
	justify-content: center;
  }
  
  .btn-icon {
	width: 20px;
	height: 20px;
  }
  
  .btn-primary {
	background: linear-gradient(135deg, #d4af37, #c19b2e);
	color: #1a1a1a;
	box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  }
  
  .btn-primary:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
  }
  
  .btn-secondary {
	background: transparent;
	color: #d4af37;
	border: 2px solid #d4af37;
  }
  
  .btn-secondary:hover {
	background: #d4af37;
	color: #1a1a1a;
	transform: translateY(-2px);
  }
  
  .features {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 2rem;
	margin-top: 4rem;
  }
  
  .feature {
	text-align: center;
	padding: 2rem;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 1rem;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(212, 175, 55, 0.3);
  }
  
  .feature-icon {
	font-size: 3rem;
	margin-bottom: 1rem;
  }
  
  .feature h3 {
	color: #d4af37;
	margin-bottom: 1rem;
	font-size: 1.25rem;
  }
  
  .feature p {
	color: #e0e0e0;
	line-height: 1.6;
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
  
  .ball-8-small {
	width: 40px;
	height: 40px;
	background-color: #000;
	border-radius: 50%;
	position: relative;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .ball-8-small::after {
	content: "8";
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: white;
	font-weight: bold;
	font-size: 18px;
  }
  
  .ball-1 { background-color: #ffeb3b; }
  .ball-2 { background-color: #2196f3; }
  .ball-3 { background-color: #f44336; }
  .ball-4 { background-color: #9c27b0; }
  .ball-5 { background-color: #ff9800; }
  
  .floating {
	animation: float 6s ease-in-out infinite;
  }
  
  .footer {
	text-align: center;
	padding: 2rem;
	background: rgba(0, 0, 0, 0.3);
	color: #e0e0e0;
  }
  
  @keyframes float {
	0%, 100% { transform: translateY(0px) rotate(0deg); }
	50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  /* Responsive */
  @media (max-width: 768px) {
	.main-title {
	  font-size: 2.5rem;
	}
	
	.pong-table-container {
	  margin: 1.5rem 0;
	}
	
	.pong-table {
	  transform: scale(0.8);
	}
	
	.action-buttons {
	  flex-direction: column;
	  align-items: center;
	}
	
	.header {
	  flex-direction: column;
	  gap: 1rem;
	}
  }

  .features-buttons {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2rem;
  margin-top: 4rem;
  flex-wrap: nowrap; /* Empêche le retour à la ligne */
}

.feature-button {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  flex: 1; /* Chaque bouton prend la même largeur */
  min-width: 200px; /* Largeur minimale pour éviter qu'ils soient trop petits */
  max-width: 300px; /* Largeur maximale pour éviter qu'ils soient trop grands */
}

.feature-button:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  border-color: #d4af37;
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
}

.feature-button:hover .button-arrow {
  transform: translateX(5px);
  opacity: 1;
}

.feature-button .feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.feature-button:hover .feature-icon {
  transform: scale(1.1);
}

.feature-button h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  transition: color 0.3s ease;
}

.feature-button:hover h3 {
  color: #fff;
}

.feature-button p {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 0;
  font-size: 0.9rem; /* Légèrement plus petit pour tenir sur une ligne */
}

.button-arrow {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: bold;
  opacity: 0;
  transition: all 0.3s ease;
}

/* Responsive pour les boutons de fonctionnalités */
@media (max-width: 768px) {
  .features-buttons {
    flex-direction: column; /* Sur mobile, on revient en colonne */
    align-items: center;
    gap: 1rem;
  }
  
  .feature-button {
    padding: 1.5rem;
    max-width: 100%;
    width: 100%;
  }
}

/* Pour les écrans moyens, on peut réduire l'espacement */
@media (max-width: 1024px) and (min-width: 769px) {
  .features-buttons {
    gap: 1rem;
  }
  
  .feature-button {
    padding: 1.5rem;
    min-width: 180px;
  }
  
  .feature-button p {
    font-size: 0.85rem;
  }
}
  </style>