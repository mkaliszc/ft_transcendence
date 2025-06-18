<template>
	<div class="profile min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-10">
	  <div class="container mx-auto px-4">
		<!-- État de chargement -->
		<div v-if="isLoadingData" class="text-center py-20">
		  <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
		  <p class="text-white mt-4 text-xl">{{ $t('loading') }}...</p>
		</div>

		<!-- Contenu principal -->
		<div v-else>
		  <h1 class="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			{{ $t('profileTitle') }} {{ username }}
		  </h1>
		  
		  <!-- Section principale du profil -->
		  <div class="profile-container bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-yellow-500/30 shadow-2xl">
			<div class="avatar-section">
			  <div class="avatar-wrapper">
				<img :src="displayAvatar" alt="Avatar" class="avatar" />
			  </div>
			  <div class="player-rank">
				<span class="rank-label">{{ $t('rank') }}</span>
				<span class="rank-value">{{ playerRank }}</span>
			  </div>
			</div>
			
			<div class="info-section">
			  <div class="info-row">
				<span class="label">{{ $t('username') }}:</span>
				<input 
				  v-model="username" 
				  type="text" 
				  class="input-field"
				  :placeholder="$t('enterUsername')"
				  readonly
				/>
			  </div>
			  
			  <div class="info-row">
				<span class="label">{{ $t('level') }}:</span>
				<div class="level-display">
				  <span class="value">{{ level }}</span>
				  <div class="level-progress">
					<div class="progress-bar" :style="{ width: levelProgress + '%' }"></div>
				  </div>
				  <span class="level-text">{{ experienceText }}</span>
				</div>
			  </div>
			  
			  <div class="info-row">
				<span class="label">{{ $t('pongRating') }}:</span>
				<div class="rating-display">
				  <span class="rating-value">{{ pongStats.rating }}</span>
				  <div class="rating-stars">
					<span v-for="star in ratingStars" :key="star" class="star">⭐</span>
				  </div>
				</div>
			  </div>

			  <div class="info-row">
				<span class="label">{{ $t('status') }}:</span>
				<span class="status online">{{ $t('online') }}</span>
			  </div>

			  <div class="info-row">
				<span class="label">{{ $t('memberSince') }}:</span>
				<span class="value">{{ formatDate(memberSince) }}</span>
			  </div>

			  <div class="info-row">
				<span class="label">{{ $t('title') }}:</span>
				<span class="value title-badge">{{ playerTitle }}</span>
			  </div>
			</div>
		  </div>

		  <!-- Popup pour l'édition du profil -->
		  <div v-if="showEditProfile" class="modal-overlay" @click="closeEditProfile">
			<div class="edit-profile-modal" @click.stop>
			  <button @click="closeEditProfile" class="modal-close">×</button>
			  
			  <h2 class="modal-title">
				⚙️ {{ $t('editProfile') || 'Modifier le profil' }}
			  </h2>
			  
			  <div class="edit-form">
				<!-- Modification du nom d'utilisateur -->
				<div class="edit-row">
				  <label class="edit-label">{{ $t('username') }}:</label>
				  <div class="edit-input-group">
					<input 
					  v-model="editableProfile.username" 
					  type="text" 
					  class="edit-input"
					  :placeholder="$t('enterUsername')"
					  :disabled="isUpdating"
					  maxlength="20"
					/>
					<span class="input-hint">Max 20 caractères</span>				</div>
				</div>

				<!-- Gestion de la 2FA -->
				<div class="edit-row">
				  <label class="edit-label">{{ $t('twoFA') || 'Authentification à deux facteurs' }}:</label>
				  <div class="edit-input-group">
					<div class="twofa-section">
					  <div class="twofa-status">
						<span class="twofa-indicator" :class="{ 'active': editableProfile.twoFA }">
						  {{ editableProfile.twoFA ? '🔒 Activée' : '🔓 Désactivée' }}
						</span>
						<span class="twofa-description">
						  {{ editableProfile.twoFA ? 'Votre compte est sécurisé' : 'Renforcez la sécurité de votre compte' }}
						</span>
					  </div>
					  
					  <!-- QR Code pour l'activation de la 2FA -->
					  <div v-if="showQRCode && qrCodeData" class="qr-code-section">
						<h4 class="qr-title">📱 Scannez ce QR code avec votre app d'authentification</h4>
						<div class="qr-code-container">
						  <img :src="qrCodeData" alt="QR Code 2FA" class="qr-code-image" />
						</div>
						<div class="qr-instructions">
						  <p><strong>Instructions :</strong></p>
						  <ol>
							<li>Ouvrez votre app d'authentification (Google Authenticator, Authy, etc.)</li>
							<li>Scannez ce QR code</li>
							<li>Entrez le code à 6 chiffres généré par l'app</li>
						  </ol>
						</div>
						
						<!-- Champ de vérification -->
						<div class="verification-section">
						  <input 
							v-model="verificationCode"
							type="text" 
							class="edit-input verification-input"
							placeholder="Code à 6 chiffres"
							maxlength="6"
							:disabled="isUpdating"
						  />
						  <div class="verification-buttons">
							<button 
							  @click="verify2FASetup"
							  :disabled="isUpdating || verificationCode.length !== 6"
							  class="verify-button"
							>
							  ✅ Vérifier et activer
							</button>
							<button 
							  @click="cancel2FASetup"
							  :disabled="isUpdating"
							  class="cancel-button"
							>
							  ❌ Annuler
							</button>
						  </div>
						</div>
					  </div>
					  
					  <!-- Bouton pour activer/désactiver la 2FA -->
					  <button 
						v-if="shouldShow2FAButton"
						@click="toggle2FA"
						:disabled="isUpdating"
						class="twofa-toggle-button"
						:class="{ 'active': editableProfile.twoFA }"
					  >
						{{ editableProfile.twoFA ? '🔓 Désactiver la 2FA' : '🔒 Activer la 2FA' }}
					  </button>
					</div>
				  </div>
				</div>

				<!-- Changement de mot de passe -->
				<div class="edit-row">
				  <label class="edit-label">{{ $t('password') || 'Mot de passe' }}:</label>
				  <div class="edit-input-group">
					<div class="password-section">
					  <div class="password-fields">
						<div class="password-input-container">
						  <input 
							v-model="passwordChange.current" 
							:type="showPasswords.current ? 'text' : 'password'"
							class="edit-input"
							placeholder="Mot de passe actuel"
							:disabled="isUpdating"
						  />
						  <button 
							type="button" 
							@click="togglePasswordVisibility('current')" 
							class="password-toggle"
							:disabled="isUpdating"
						  >
							<span v-if="showPasswords.current">👁️</span>
							<span v-else>🙈</span>
						  </button>
						</div>
						
						<div class="password-input-container">
						  <input 
							v-model="passwordChange.new" 
							:type="showPasswords.new ? 'text' : 'password'"
							class="edit-input"
							placeholder="Nouveau mot de passe"
							:disabled="isUpdating"
						  />
						  <button 
							type="button" 
							@click="togglePasswordVisibility('new')" 
							class="password-toggle"
							:disabled="isUpdating"
						  >
							<span v-if="showPasswords.new">👁️</span>
							<span v-else>🙈</span>
						  </button>
						</div>
						
						<div class="password-input-container">
						  <input 
							v-model="passwordChange.confirm" 
							:type="showPasswords.confirm ? 'text' : 'password'"
							class="edit-input"
							placeholder="Confirmer le nouveau mot de passe"
							:disabled="isUpdating"
						  />
						  <button 
							type="button" 
							@click="togglePasswordVisibility('confirm')" 
							class="password-toggle"
							:disabled="isUpdating"
						  >
							<span v-if="showPasswords.confirm">👁️</span>
							<span v-else>🙈</span>
						  </button>
						</div>
					  </div>
					  
					  <button 
						@click="changePassword"
						:disabled="isUpdating || !canChangePassword"
						class="password-change-button"
					  >
						🔑 Changer le mot de passe
					  </button>
					  
					  <span class="input-hint">
						Laissez vide si vous ne voulez pas changer votre mot de passe
					  </span>
					</div>
				  </div>
				</div>

				<!-- Modification de l'avatar -->
				<div class="edit-row">
				  <label class="edit-label">{{ $t('avatar') || 'Avatar' }}:</label>
				  <div class="edit-input-group">
					<div class="avatar-selection">
					  <div class="current-avatar">
						<img :src="editableProfile.avatar || DEFAULT_AVATAR" alt="Avatar actuel" class="mini-avatar" />
						<span>{{ isCustomAvatar ? 'Avatar personnalisé' : 'Avatar par défaut' }}</span>
					  </div>
					  
					  <!-- Upload de fichier personnalisé -->
					  <div class="avatar-upload">
						<label for="avatar-file" class="upload-button">
						  📁 {{ isCustomAvatar ? 'Changer l\'avatar' : 'Télécharger une image' }}
						</label>
						<input 
						  id="avatar-file" 
						  type="file" 
						  accept="image/*" 
						  @change="handleAvatarUpload"
						  class="file-input"
						  :disabled="isUpdating"
						/>
						<span class="upload-hint">PNG, JPG jusqu'à 2MB</span>
					  </div>
					  
					  <!-- Bouton pour revenir à l'avatar par défaut (seulement si avatar personnalisé) -->
					  <div v-if="isCustomAvatar" class="avatar-reset">
						<button 
						  @click="resetToDefaultAvatar"
						  class="reset-avatar-button"
						  :disabled="isUpdating"
						>
						  ↻ Revenir à l'avatar par défaut
						</button>
					  </div>
					</div>
				  </div>
				</div>

				<!-- Boutons d'action -->
				<div class="edit-actions">
				  <button 
					@click="saveProfile" 
					:disabled="isUpdating || !hasChanges"
					class="btn-save"
				  >
					<span v-if="isUpdating">
					  <div class="spinner"></div>
					  {{ $t('saving') || 'Sauvegarde...' }}
					</span>
					<span v-else>
					  💾 {{ $t('saveChanges') || 'Sauvegarder' }}
					</span>
				  </button>
				  
				  <button 
					@click="resetProfile" 
					:disabled="isUpdating"
					class="btn-reset"
				  >
					🔄 {{ $t('reset') || 'Annuler' }}
				  </button>
				</div>

				<!-- Messages de feedback -->
				<div v-if="updateMessage" class="update-message" :class="updateMessage.type">
				  {{ updateMessage.text }}
				</div>
			  </div>
			</div>
		  </div>
		  
		  <!-- Statistiques Pong -->
		  <div class="stats mt-10">
			<h2 class="text-3xl font-bold text-white mb-4 text-center flex items-center justify-center gap-3">
			  {{ $t('pongStatistics') }}
			</h2>
			
			<!-- Indicateur pour les matchs en ligne uniquement -->
			<div class="online-only-indicator mb-6 text-center">
			  <div class="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/50 rounded-lg px-4 py-2">
				<span class="text-blue-300 text-lg">🌐</span>
				<span class="text-blue-100 font-medium">Statistiques des matchs en ligne uniquement</span>
			  </div>
			</div>
			
			<!-- Statistiques principales -->
			<div class="stats-grid mb-8">
			  <div class="stat-card">
				<div class="stat-icon">🌐</div>
				<h3>{{ $t('matchesPlayed') }} (En ligne)</h3>
				<div class="stat-value">{{ pongStats.matchesPlayed }}</div>
			  </div>
			  <div class="stat-card">
				<div class="stat-icon">🏆</div>
				<h3>{{ $t('victories') }} (En ligne)</h3>
				<div class="stat-value">{{ pongStats.victories }}</div>
				<div class="stat-subtitle">{{ pongStats.matchesPlayed - pongStats.victories }} défaites</div>
			  </div>
			  <div class="stat-card">
				<div class="stat-icon">📊</div>
				<h3>{{ $t('winRate') }} (En ligne)</h3>
				<div class="stat-value">{{ winRatePercentage }}%</div>
			  </div>
			  <div class="stat-card">
				<div class="stat-icon">⚡</div>
				<h3>{{ $t('rating') }}</h3>
				<div class="stat-value">{{ pongStats.rating }}</div>
			  </div>
			</div>

			<!-- Historique des matches et Évolution du Winrate -->
			<div class="charts-section">
			  <!-- Historique des matches détaillé -->
			  <div class="chart-container match-history-extended">
				<h3 class="chart-title">🌐 {{ $t('matchHistory') }} (Matchs en ligne)</h3>
				<div class="history-list" v-if="pongMatchHistory.length > 0">
				  <div 
					v-for="match in pongMatchHistory" 
					:key="match.id"
					class="match-item"
				  >
					<div class="match-result">
					  <div :class="['result-indicator', match.won ? 'win' : 'loss']">
						{{ match.won ? 'V' : 'D' }}
					  </div>
					</div>
					<div class="match-details">
					  <div class="match-score">
						{{ match.playerScore }} - {{ match.opponentScore }}
					  </div>
					  <div class="match-info">
						<span class="match-opponent">vs {{ match.opponent }}</span>
						<span class="match-duration">{{ match.duration }}</span>
					  </div>
					  <div class="match-stats">
						<span class="match-date">{{ formatDate(match.date) }}</span>
					  </div>
					</div>
					<div class="match-points">
					  <span class="points-earned">+{{ match.pointsEarned }}</span>
					  <div class="match-rating">
						<span class="rating-change" :class="match.ratingChange >= 0 ? 'positive' : 'negative'">
						  {{ match.ratingChange >= 0 ? '+' : '' }}{{ match.ratingChange }}
						</span>
					  </div>
					</div>
				  </div>
				</div>
				<!-- Message quand aucun historique -->
				<div v-else class="no-history">
				  <div class="no-history-icon">🌐</div>
				  <h4 class="no-history-title">Aucun match en ligne joué</h4>
				  <p class="no-history-text">Commencez à jouer en ligne pour voir votre historique !</p>
				</div>
			  </div>

			  <!-- Diagramme d'évolution du Winrate -->
			  <div class="chart-container">
				<h3 class="chart-title">{{ $t('winrateEvolution') }} (Matchs en ligne)</h3>
				<div class="winrate-chart">
				  <div class="chart-area">
					<svg class="winrate-svg" viewBox="0 0 400 200">
					  <!-- Grille de fond -->
					  <defs>
						<pattern id="winrate-grid" width="40" height="20" patternUnits="userSpaceOnUse">
						  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" stroke-width="1" opacity="0.3"/>
						</pattern>
					  </defs>
					  <rect width="400" height="200" fill="url(#winrate-grid)" />
					  
					  <!-- Ligne de 50% (ligne de référence) -->
					  <line x1="0" y1="100" x2="400" y2="100" stroke="#6b7280" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
					  
					  <!-- Aire sous la courbe -->
					  <path
						:d="winrateAreaPath"
						fill="url(#winrateGradient)"
						opacity="0.3"
					  />
					  
					  <!-- Ligne de winrate -->
					  <polyline
						:points="winrateLinePoints"
						fill="none"
						stroke="#d4af37"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					  />
					  
					  <!-- Points de données -->
					  <circle
						v-for="(point, index) in winratePoints"
						:key="index"
						:cx="point.x"
						:cy="point.y"
						r="4"
						fill="#d4af37"
						stroke="#ffffff"
						stroke-width="2"
					  />
					  
					  <!-- Dégradé pour l'aire -->
					  <defs>
						<linearGradient id="winrateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						  <stop offset="0%" style="stop-color:#d4af37;stop-opacity:0.8" />
						  <stop offset="100%" style="stop-color:#d4af37;stop-opacity:0.1" />
						</linearGradient>
					  </defs>
					</svg>
				  </div>
				  <div class="chart-labels">
					<span v-for="(data, index) in winrateHistory" :key="index" class="chart-label">
					  {{ formatShortDate(data.date) }}
					</span>
				  </div>
				  <div class="chart-legend">
					<div class="legend-item">
					  <div class="legend-color" style="background-color: #d4af37;"></div>
					  <span>{{ $t('winRate') }}</span>
					</div>
					<div class="current-winrate">
					  {{ $t('current') }}: {{ winRatePercentage }}%
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </div>

		  <!-- Boutons d'action -->
		  <div class="flex justify-center gap-4 mt-8">
			<button 
			  @click="openEditProfile" 
			  class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
			>
			  ⚙️ {{ $t('editProfile') || 'Modifier le profil' }}
			</button>
			<router-link 
			  to="/Home2" 
			  class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
			>
			  🏠 {{ $t('backToHome') }}
			</router-link>
		  </div>
		</div>
	  </div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../composable/useAuths';
import { useUser } from '../composable/useUser';
import { useRouter } from 'vue-router';
import { userApi } from '../services/userAPI.ts';
import { TwoFactorService } from '../services/twoFactorAPI.ts';
import { DEFAULT_AVATARS_BASE64, resizeImageToBase64, isValidImageBase64, getBase64Size } from '../utils/imageUtils.ts';

const { t } = useI18n()
const { user: currentUser, isAuthenticated, initializeAuth } = useAuth();
const { fetchUser, fetchHistory, isLoading, error } = useUser();
const router = useRouter();

// État local avec la Composition API
const username = ref('')
const level = ref(1)
const avatar = ref(DEFAULT_AVATARS_BASE64.default) // Utilise l'avatar par défaut en base64
const memberSince = ref(new Date())

// Données backend réelles
const userProfile = ref(null)
const matchHistory = ref([])
const isLoadingData = ref(true)

// Statistiques Pong calculées à partir des vraies données
const pongStats = ref({
  matchesPlayed: 0,
  victories: 0,
  rating: 1000,
  avgReactionTime: 200, // Valeur par défaut
  accuracy: 0,
  longestRally: 0,
  ballControl: 50, // Valeurs simulées pour le moment
  defensivePlay: 50,
  aggressivePlay: 50,
  totalPlayTime: 0
})

// Computed properties
const winRatePercentage = computed(() => {
  return pongStats.value.matchesPlayed > 0 ? Math.round((pongStats.value.victories / pongStats.value.matchesPlayed) * 100) : 0
})

const levelProgress = computed(() => {
  const baseMatches = (level.value - 1) * 10
  const currentMatches = pongStats.value.matchesPlayed // Nombre de matchs en ligne seulement
  const progressInLevel = currentMatches - baseMatches
  return Math.min((progressInLevel / 10) * 100, 100)
})

const experienceText = computed(() => {
  const nextLevel = level.value + 1
  const baseMatches = (level.value - 1) * 10
  const currentMatches = pongStats.value.matchesPlayed // Nombre de matchs en ligne seulement
  const progressInLevel = currentMatches - baseMatches
  const remaining = 10 - progressInLevel
  return `${remaining} matchs en ligne vers niveau ${nextLevel}`
})

const playerTitle = computed(() => {
  const rating = pongStats.value.rating
  if (rating >= 2000) return 'Légende du Pong'
  if (rating >= 1800) return 'Maître Paddle'
  if (rating >= 1600) return 'Expert Pong'
  if (rating >= 1400) return 'Joueur Avancé'
  if (rating >= 1200) return 'Joueur Confirmé'
  return 'Débutant'
})

const playerRank = computed(() => {
  const rating = pongStats.value.rating
  if (rating >= 2000) return 'Diamant'
  if (rating >= 1800) return 'Platine'
  if (rating >= 1600) return 'Or'
  if (rating >= 1400) return 'Argent'
  if (rating >= 1200) return 'Bronze'
  return 'Fer'
})

const ratingStars = computed(() => {
  return Math.floor(pongStats.value.rating / 400) + 1
})

// Computed pour l'avatar avec fallback
const displayAvatar = computed(() => {
  return avatar.value || DEFAULT_AVATAR
})

// Computed pour détecter si l'avatar actuel est personnalisé (non-défaut)
const isCustomAvatar = computed(() => {
  const currentAvatar = editableProfile.value.avatar
  return currentAvatar && 
         currentAvatar !== DEFAULT_AVATAR && 
         !Object.values(DEFAULT_AVATARS_BASE64).includes(currentAvatar)
})

// URL de l'avatar par défaut (même que le backend)
const DEFAULT_AVATAR = DEFAULT_AVATARS_BASE64.default

// Données d' évolution du winrate (calculées à partir des vraies données)
const winrateHistory = ref([
  { date: new Date(), winrate: 50 }
])

// Historique des matches (formaté pour l'affichage)
const pongMatchHistory = ref([])

// Variables pour l'édition du profil
const showEditProfile = ref(false)
const editableProfile = ref({
  username: '',
  twoFA: false,
  avatar: null // L'avatar par défaut sera null comme en DB
})

const originalProfile = ref({})
const isUpdating = ref(false)
const updateMessage = ref(null)

// Variables pour le changement de mot de passe
const passwordChange = ref({
  current: '',
  new: '',
  confirm: ''
})

const showPasswords = ref({
  current: false,
  new: false,
  confirm: false
})

// Variables pour la 2FA
const twoFactorService = TwoFactorService.getInstance()
const qrCodeData = ref(null)
const twoFASecret = ref('')
const showQRCode = ref(false)
const verificationCode = ref('')
const is2FABeingSetup = ref(false)

// Fonction pour réinitialiser l'état 2FA
const reset2FAState = () => {
  console.log('🔄 Resetting 2FA state')
  showQRCode.value = false
  qrCodeData.value = null
  twoFASecret.value = ''
  verificationCode.value = ''
  is2FABeingSetup.value = false
  console.log('🔄 2FA state reset complete:', {
    showQRCode: showQRCode.value,
    qrCodeData: qrCodeData.value
  })
}

// Computed pour vérifier s'il y a des changements
const hasChanges = computed(() => {
  return editableProfile.value.username !== originalProfile.value.username ||
         editableProfile.value.twoFA !== originalProfile.value.twoFA ||
         editableProfile.value.avatar !== originalProfile.value.avatar
})

// Computed pour vérifier si le changement de mot de passe est possible
const canChangePassword = computed(() => {
  return passwordChange.value.current && 
         passwordChange.value.new && 
         passwordChange.value.confirm &&
         passwordChange.value.new === passwordChange.value.confirm &&
         passwordChange.value.new.length >= 6
})

// Computed pour déboguer l'état du bouton 2FA
const shouldShow2FAButton = computed(() => {
  const shouldShow = !showQRCode.value
  console.log('🔍 shouldShow2FAButton:', {
    showQRCode: showQRCode.value,
    shouldShow: shouldShow,
    editableProfile_twoFA: editableProfile.value.twoFA,
    isUpdating: isUpdating.value
  })
  return shouldShow
})

// Fonction pour charger les données utilisateur depuis le backend
const loadUserData = async () => {
  try {
    console.log('Starting loadUserData...')
    isLoadingData.value = true
    
    // Récupérer les informations du profil utilisateur
    console.log('Fetching user data...')
    const userInfo = await fetchUser()
    console.log('User info received:', userInfo)
    userProfile.value = userInfo
    
    // Mise à jour des données de base
    username.value = userInfo.username || ''
    memberSince.value = new Date(userInfo.created_at) || new Date()
    avatar.value = userInfo.avatar || DEFAULT_AVATAR // Utilise l'avatar par défaut si null en DB
    
    // Initialiser les données éditables
    editableProfile.value = {
      username: userInfo.username || '',
      twoFA: userInfo.twoFA || false,
      avatar: userInfo.avatar || DEFAULT_AVATAR // Utilise l'avatar par défaut si null en DB
    }
    
    // Sauvegarder l'état original
    originalProfile.value = { ...editableProfile.value }
    
    // Calcul des statistiques à partir des vraies données (sera mise à jour par processMatchHistory)
    pongStats.value.matchesPlayed = 0 // Sera calculé avec les matchs en ligne seulement
    pongStats.value.victories = 0     // Sera calculé avec les matchs en ligne seulement
    
    // Calcul du niveau basé sur le nombre de matches en ligne
    // level.value sera recalculé après avoir filtré les matchs en ligne
    
    // Calcul du rating basé sur le ratio des matchs en ligne
    const ratio = userInfo.ratio || 0
    pongStats.value.rating = Math.round(1000 + (ratio * 800))
    
    console.log('Stats calculated:', pongStats.value)
    
    // Récupérer l'historique des matches depuis le serveur
    try {
      console.log('Fetching match history from server...')
      const history = await userApi.getHistory(userInfo.username)
      if (history && history.matches) {
        matchHistory.value = history.matches
        // Traiter les données d'historique pour les graphiques
        processMatchHistory(history.matches)
      }
    } catch (historyError) {
      console.log('Aucun historique de matches trouvé:', historyError)
      // Utiliser des données par défaut si pas d'historique
      generateDefaultData()
    }
    
    console.log('User data loaded successfully')
    
  } catch (err) {
    console.error('Erreur lors du chargement des données utilisateur:', err)
    // Utiliser des données par défaut en cas d'erreur
    generateDefaultData()
  } finally {
    console.log('Setting isLoadingData to false')
    isLoadingData.value = false
  }
}

const processMatchHistory = (matches) => {
  // Filtrer uniquement les matchs en ligne (exclure les matchs contre l'IA)
  const onlineMatches = matches.filter(match => 
    match.opponents && 
    match.opponents.length > 0 && 
    match.opponents[0]?.username && 
    match.opponents[0]?.username !== 'IA' &&
    match.opponents[0]?.username.toLowerCase() !== 'ia' &&
    match.opponents[0]?.username.toLowerCase() !== 'bot'
  )
  
  // Mettre à jour les statistiques pour ne compter que les matchs en ligne
  pongStats.value.matchesPlayed = onlineMatches.length
  pongStats.value.victories = onlineMatches.filter(match => match.i_won).length
  
  // Recalculer le niveau basé sur les matchs en ligne seulement
  level.value = Math.floor(onlineMatches.length / 10) + 1
  
  // Calculer les données de winrate au fil du temps (seulement matchs en ligne)
  let wins = 0
  const winrateData = []
  
  onlineMatches.slice(-10).forEach((match, index) => {
    if (match.i_won) wins++
    const winrate = Math.round((wins / (index + 1)) * 100)
    winrateData.push({
      date: new Date(match.match_date),
      winrate: winrate
    })
  })
  
  winrateHistory.value = winrateData.length > 0 ? winrateData : [
    { date: new Date(), winrate: pongStats.value.matchesPlayed > 0 ? Math.round((pongStats.value.victories / pongStats.value.matchesPlayed) * 100) : 0 }
  ]
  
  // Adapter l'historique des matches pour l'affichage (seulement matches en ligne)
  pongMatchHistory.value = onlineMatches.slice(0, 10).map((match, index) => ({
    id: index + 1,
    playerScore: match.my_score,
    opponentScore: match.opponents[0]?.score || 0,
    opponent: match.opponents[0]?.username || 'Inconnu',
    won: match.i_won,
    duration: formatDuration(match.game_duration),
    pointsEarned: match.i_won ? 20 : 5,
    ratingChange: match.i_won ? Math.floor(Math.random() * 20) + 5 : -Math.floor(Math.random() * 15) - 5,
    date: new Date(match.match_date)
  }))
}

// Générer des données par défaut (pas de matchs en ligne)
const generateDefaultData = () => {
  // Réinitialiser les statistiques pour les matchs en ligne seulement
  pongStats.value.matchesPlayed = 0
  pongStats.value.victories = 0
  level.value = 1 // Niveau 1 si aucun match en ligne
  
  const currentWinRate = 0 // Pas de matchs en ligne = 0% winrate
  winrateHistory.value = [
    { date: new Date(), winrate: currentWinRate }
  ]
  pongMatchHistory.value = []
}

// Fonction pour formater la durée
const formatDuration = (seconds) => {
  if (!seconds) return '0m 0s'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

// Computed pour les graphiques winrate
const winrateLinePoints = computed(() => {
  if (winrateHistory.value.length === 0) return ''
  return winrateHistory.value.map((item, index) => {
    const x = (index / (winrateHistory.value.length - 1)) * 380 + 10
    const y = 180 - ((item.winrate / 100) * 160)
    return `${x},${y}`
  }).join(' ')
})

const winrateAreaPath = computed(() => {
  if (winrateHistory.value.length === 0) return ''
  const points = winrateHistory.value.map((item, index) => {
    const x = (index / (winrateHistory.value.length - 1)) * 380 + 10
    const y = 180 - ((item.winrate / 100) * 160)
    return { x, y }
  })
  
  let path = `M ${points[0].x} 180`
  points.forEach(point => {
    path += ` L ${point.x} ${point.y}`
  })
  path += ` L ${points[points.length - 1].x} 180 Z`
  
  return path
})

const winratePoints = computed(() => {
  if (winrateHistory.value.length === 0) return []
  return winrateHistory.value.map((item, index) => {
    const x = (index / (winrateHistory.value.length - 1)) * 380 + 10
    const y = 180 - ((item.winrate / 100) * 160)
    return { x, y }
  })
})

// Méthodes
const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Fonctions pour l'édition du profil
const openEditProfile = () => {
  console.log('🟢 Opening edit profile')
  console.log('🟢 Initial 2FA state:', {
    showQRCode: showQRCode.value,
    qrCodeData: qrCodeData.value,
    editableProfile_twoFA: editableProfile.value.twoFA
  })
  showEditProfile.value = true
  // Réinitialiser l'état 2FA
  reset2FAState()
  console.log('🟢 After reset 2FA state:', {
    showQRCode: showQRCode.value,
    qrCodeData: qrCodeData.value
  })
  // Réinitialiser le message d'erreur
  if (updateMessage.value) {
    updateMessage.value = null
  }
}

const closeEditProfile = () => {
  showEditProfile.value = false
  // Réinitialiser le message d'erreur
  if (updateMessage.value) {
    updateMessage.value = null
  }
}

const toggleEditProfile = () => {
  showEditProfile.value = !showEditProfile.value
  // Réinitialiser le message d'erreur quand on ferme/ouvre la section
  if (updateMessage.value) {
    updateMessage.value = null
  }
}

const selectAvatar = (avatarUrl) => {
  editableProfile.value.avatar = avatarUrl
}

const resetToDefaultAvatar = () => {
  editableProfile.value.avatar = DEFAULT_AVATAR
  updateMessage.value = {
    type: 'success',
    text: 'Avatar remis par défaut'
  }
  
  // Effacer le message après 3 secondes
  setTimeout(() => {
    updateMessage.value = null
  }, 3000)
}

// Fonction pour basculer la visibilité des mots de passe
const togglePasswordVisibility = (field) => {
  showPasswords.value[field] = !showPasswords.value[field]
}

// Fonction pour activer/désactiver la 2FA
const toggle2FA = async () => {
  console.log('🔴 toggle2FA called', { 
    twoFA: editableProfile.value.twoFA, 
    showQRCode: showQRCode.value,
    isUpdating: isUpdating.value 
  })
  
  // Log pour déboguer
  console.log('🔴 Button clicked! Function is executing...')
  
  try {
    console.log('🔴 Setting isUpdating to true')
    isUpdating.value = true
    updateMessage.value = null
    
    if (!editableProfile.value.twoFA) {
      console.log('🔴 Activating 2FA - generating QR code')
      // Activation de la 2FA - générer le QR code
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('accessToken')
      console.log('🔴 Token found:', !!token)
      if (!token) {
        throw new Error('Token d\'authentification non trouvé')
      }
      
      console.log('🔴 Calling twoFactorService.enable2FA')
      is2FABeingSetup.value = true
      const response = await twoFactorService.enable2FA(token)
      console.log('🔴 Response from enable2FA:', response)
      
      qrCodeData.value = response.qrCode
      twoFASecret.value = response.secret
      showQRCode.value = true
      console.log('🔴 QR code data set, showQRCode:', showQRCode.value)
      
      updateMessage.value = {
        type: 'info',
        text: 'Scannez le QR code avec votre app d\'authentification'
      }
      console.log('🔴 Update message set')
    } else {
      // Désactivation de la 2FA
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Token d\'authentification non trouvé')
      }
      
      const response = await twoFactorService.disable2FA(token)
      
      if (response.success) {
        editableProfile.value.twoFA = false
        originalProfile.value.twoFA = false
        
        // Réinitialiser les variables 2FA
        showQRCode.value = false
        qrCodeData.value = null
        twoFASecret.value = ''
        verificationCode.value = ''
        is2FABeingSetup.value = false
        
        updateMessage.value = {
          type: 'success',
          text: '2FA désactivée avec succès !'
        }
      } else {
        throw new Error(response.message || 'Erreur lors de la désactivation de la 2FA')
      }
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 3000)
    
  } catch (error) {
    console.error('🔴 Error in toggle2FA:', error)
    console.log('🔴 Error message:', error.message)
    console.log('🔴 Error stack:', error.stack)
    updateMessage.value = {
      type: 'error',
      text: error.message || 'Erreur lors de la modification de la 2FA'
    }
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 5000)
  } finally {
    console.log('🔴 Setting isUpdating to false in finally')
    isUpdating.value = false
  }
}

// Fonction pour changer le mot de passe
const changePassword = async () => {
  if (!canChangePassword.value) return
  
  try {
    isUpdating.value = true
    updateMessage.value = null
    
    // Validation côté client
    if (passwordChange.value.new !== passwordChange.value.confirm) {
      throw new Error('Les nouveaux mots de passe ne correspondent pas')
    }
    
    if (passwordChange.value.new.length < 6) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères')
    }
    
    // Appel API pour changer le mot de passe
    const response = await userApi.changePassword({
      currentPassword: passwordChange.value.current,
      newPassword: passwordChange.value.new
    })
    
    console.log('Password changed successfully:', response)
    
    // Réinitialiser les champs de mot de passe
    passwordChange.value = {
      current: '',
      new: '',
      confirm: ''
    }
    
    updateMessage.value = {
      type: 'success',
      text: 'Mot de passe changé avec succès !'
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 3000)
    
  } catch (error) {
    console.error('Error changing password:', error)
    updateMessage.value = {
      type: 'error',
      text: error.message || 'Erreur lors du changement de mot de passe'
    }
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 5000)
  } finally {
    isUpdating.value = false
  }
}

// Fonction pour vérifier et activer la 2FA
const verify2FASetup = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    updateMessage.value = {
      type: 'error',
      text: 'Veuillez entrer un code à 6 chiffres'
    }
    return
  }
  
  try {
    isUpdating.value = true
    updateMessage.value = null
    
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('Token d\'authentification non trouvé')
    }
    
    const response = await twoFactorService.verify2FA(token, verificationCode.value)
    
    if (response.success) {
      // Activer la 2FA dans le profil
      editableProfile.value.twoFA = true
      originalProfile.value.twoFA = true
      
      // Réinitialiser l'interface de configuration
      showQRCode.value = false
      qrCodeData.value = null
      twoFASecret.value = ''
      verificationCode.value = ''
      is2FABeingSetup.value = false
      
      updateMessage.value = {
        type: 'success',
        text: '2FA activée avec succès ! Votre compte est maintenant sécurisé.'
      }
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        updateMessage.value = null
      }, 3000)
    } else {
      throw new Error(response.message || 'Code de vérification invalide')
    }
    
  } catch (error) {
    console.error('Error verifying 2FA setup:', error)
    updateMessage.value = {
      type: 'error',
      text: error.message || 'Erreur lors de la vérification du code'
    }
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 5000)
  } finally {
    isUpdating.value = false
  }
}

// Fonction pour annuler la configuration 2FA
const cancel2FASetup = () => {
  // Réinitialiser toutes les variables de configuration 2FA
  showQRCode.value = false
  qrCodeData.value = null
  twoFASecret.value = ''
  verificationCode.value = ''
  is2FABeingSetup.value = false
  
  updateMessage.value = {
    type: 'info',
    text: 'Configuration 2FA annulée'
  }
  
  // Effacer le message après 2 secondes
  setTimeout(() => {
    updateMessage.value = null
  }, 2000)
}

// Fonction pour sauvegarder le profil
const saveProfile = async () => {
  if (!hasChanges.value) return
  
  isUpdating.value = true
  updateMessage.value = null
  
  try {
    // Validation côté client
    if (!editableProfile.value.username.trim()) {
      throw new Error('Le nom d\'utilisateur ne peut pas être vide')
    }
    
    if (editableProfile.value.username.length > 20) {
      throw new Error('Le nom d\'utilisateur ne peut pas dépasser 20 caractères')
    }
    
    // Appel API pour mettre à jour le profil
    const updateData = {
      username: editableProfile.value.username.trim(),
      twoFA: editableProfile.value.twoFA,
      avatar: editableProfile.value.avatar
    }
    
    const response = await userApi.updateUser(updateData)
    console.log('Profile updated successfully:', response)
    
    // Mettre à jour les données locales
    username.value = editableProfile.value.username
    avatar.value = editableProfile.value.avatar
    originalProfile.value = { ...editableProfile.value }
    
    // Recharger les données utilisateur pour synchroniser
    await loadUserData()
    
    updateMessage.value = {
      type: 'success',
      text: 'Profil mis à jour avec succès !'
    }
    
    // Fermer la popup après une sauvegarde réussie
    setTimeout(() => {
      closeEditProfile()
    }, 1500)
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 3000)
    
  } catch (error) {
    console.error('Error updating profile:', error)
    updateMessage.value = {
      type: 'error',
      text: error.message || 'Erreur lors de la mise à jour du profil'
    }
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 5000)
  } finally {
    isUpdating.value = false
  }
}

// Fonction pour gérer l'upload d'avatar personnalisé
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      updateMessage.value = {
        type: 'error',
        text: 'Veuillez sélectionner un fichier image valide (PNG, JPG, etc.)'
      }
      return
    }
    
    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      updateMessage.value = {
        type: 'error',
        text: 'La taille du fichier ne doit pas dépasser 2MB'
      }
      return
    }
    
    // Convertir l'image en base64 avec redimensionnement
    const base64Avatar = await resizeImageToBase64(file, 150, 150, 0.8)
    
    // Vérifier la validité de l'image base64
    if (!isValidImageBase64(base64Avatar)) {
      updateMessage.value = {
        type: 'error',
        text: 'Erreur lors du traitement de l\'image'
      }
      return
    }
    
    // Vérifier la taille finale en base64
    const base64Size = getBase64Size(base64Avatar)
    console.log(`Taille de l'image en base64: ${(base64Size / 1024).toFixed(2)} KB`)
    
    // Mettre à jour l'avatar dans le profil éditable
    editableProfile.value.avatar = base64Avatar
    
    updateMessage.value = {
      type: 'success',
      text: 'Avatar téléchargé avec succès !'
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 3000)
    
  } catch (error) {
    console.error('Error uploading avatar:', error)
    updateMessage.value = {
      type: 'error',
      text: 'Erreur lors du téléchargement de l\'avatar'
    }
    
    // Effacer le message d'erreur après 5 secondes
    setTimeout(() => {
      updateMessage.value = null
    }, 5000)
  }
  
  // Réinitialiser l'input file
  event.target.value = ''
}

// Hook de cycle de vie
const handleMatchCompleted = async (event) => {
  console.log('Match completed event received:', event.detail)
  try {
    // Recharger les données utilisateur après le match
    await loadUserData()
    console.log('User data refreshed after match completion')
  } catch (error) {
    console.error('Error refreshing data after match:', error)
  }
}

// Hook de cycle de vie
onMounted(async () => {
  console.log('🟢 Profile component mounted!')
  
  // Initialiser l'authentification
  initializeAuth();
  
  console.log('🟢 Initial state:', {
    showQRCode: showQRCode.value,
    editableProfile: editableProfile.value
  })
  console.log('Profile component mounted')
  console.log('isAuthenticated:', isAuthenticated.value)
  console.log('currentUser:', currentUser.value)
  console.log('Auth tokens:', {
    auth_token: !!localStorage.getItem('auth_token'),
    user_token: !!localStorage.getItem('user-token')
  })
  
  // Le router guard s'occupe déjà de la vérification d'authentification
  // Pas besoin de vérifier ici, nous pouvons directement charger les données
  console.log('Loading user data...')
  await loadUserData()
  
  // Ajouter un écouteur d'événements pour les matches terminés
  window.addEventListener('matchCompleted', handleMatchCompleted)
  console.log('Match completed event listener added')
})

// Nettoyage lors du démontage
onUnmounted(() => {
  // Supprimer l'écouteur d'événements
  window.removeEventListener('matchCompleted', handleMatchCompleted)
  console.log('Match completed event listener removed')
})
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  color: #f8f9fa;
  position: relative;
  overflow-x: hidden;
  padding: 2rem 0;
}

.profile-container {
  display: flex;
  margin: 30px 0;
  gap: 40px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #d4af37;
  object-fit: cover;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.avatar:hover {
  transform: scale(1.05);
}

.player-rank {
  margin-top: 10px;
  text-align: center;
}

.rank-label {
  display: block;
  color: #e0e0e0;
  font-size: 0.8em;
}

.rank-value {
  display: block;
  color: #d4af37;
  font-weight: bold;
  font-size: 1.1em;
}

.info-section {
  flex: 1;
  text-align: left;
}

.info-row {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.label {
  width: 150px;
  font-weight: bold;
  color: #d4af37;
  font-size: 1.1em;
}

.value {
  font-size: 1.1em;
  color: #f8f9fa;
}

.level-display {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.level-progress {
  width: 200px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #c19b2e);
  transition: width 0.5s ease;
}

.level-text {
  font-size: 0.9em;
  color: #e0e0e0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-value {
  font-size: 1.3em;
  font-weight: bold;
  color: #d4af37;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2em;
}

.title-badge {
  background: linear-gradient(45deg, #d4af37, #c19b2e);
  color: #1a1a1a;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.9em;
}

.input-field {
  padding: 12px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
  border-radius: 8px;
  font-size: 1em;
  width: 250px;
  transition: border-color 0.3s ease;
  backdrop-filter: blur(10px);
}

.input-field:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
}

.status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.9em;
  font-weight: bold;
}

.status.online {
  background-color: #22c55e;
  color: white;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(10px);
}

.btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #d4af37;
  transform: translateY(-2px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 1rem;
  padding: 20px;
  color: #f8f9fa;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  border-color: #d4af37;
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
}

.stat-icon {
  font-size: 2em;
  margin-bottom: 8px;
}

.stat-card h3 {
  color: #d4af37;
  margin-bottom: 10px;
  font-size: 0.9em;
  font-weight: 600;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #f8f9fa;
  margin-top: 8px;
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 30px;
}

.match-history-extended {
  grid-column: 1;
}

.chart-container {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 1rem;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.chart-title {
  color: #d4af37;
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.skills-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  color: #f8f9fa;
  font-weight: 600;
}

.skill-value {
  color: #d4af37;
  font-weight: bold;
}

.skill-bar {
  height: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
}

/* Styles pour l'historique des matches étendu */
.match-history-extended .history-list {
  max-height: 400px;
  overflow-y: auto;
}

.match-history-extended .history-list::-webkit-scrollbar {
  width: 6px;
}

.match-history-extended .history-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.match-history-extended .history-list::-webkit-scrollbar-thumb {
  background: #d4af37;
  border-radius: 3px;
}

.match-history-extended .history-list::-webkit-scrollbar-thumb:hover {
  background: #c19b2e;
}

/* Styles pour le message "Aucun historique" */
.no-history {
  text-align: center;
  padding: 40px 20px;
  color: #f8f9fa;
}

.no-history-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-history-title {
  font-size: 1.5em;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 10px;
}

.no-history-text {
  color: #e0e0e0;
  margin-bottom: 25px;
  font-size: 1.1em;
}

/* Styles pour le graphique de winrate */
.winrate-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-area {
  position: relative;
  height: 200px;
}

.winrate-svg {
  width: 100%;
  height: 100%;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: #e0e0e0;
  font-size: 0.8em;
  padding: 0 10px;
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8f9fa;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.current-winrate {
  color: #d4af37;
  font-weight: bold;
}

.match-history {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 1rem;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.match-item:hover {
  border-color: #d4af37;
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.15);
}

.result-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2em;
}

.result-indicator.win {
  background-color: #22c55e;
  color: white;
}

.result-indicator.loss {
  background-color: #ef4444;
  color: white;
}

.match-details {
  flex: 1;
}

.match-score {
  font-size: 1.3em;
  font-weight: bold;
  color: #f8f9fa;
  margin-bottom: 4px;
}

.match-info {
  display: flex;
  gap: 15px;
  margin-bottom: 4px;
}

.match-opponent {
  color: #d4af37;
  font-weight: 600;
}

.match-duration {
  color: #e0e0e0;
  font-size: 0.9em;
}

.match-stats {
  display: flex;
  gap: 15px;
}

.match-date {
  color: #e0e0e0;
  font-size: 0.8em;
}

.match-points {
  text-align: right;
}

.points-earned {
  color: #d4af37;
  font-weight: bold;
  font-size: 1.1em;
  display: block;
  margin-bottom: 4px;
}

.rating-change {
  font-size: 0.9em;
  font-weight: bold;
}

.rating-change.positive {
  color: #22c55e;
}

.rating-change.negative {
  color: #ef4444;
}

/* Animation de chargement */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Styles pour les boutons d'action */
.bg-yellow-500 {
  background: linear-gradient(135deg, #d4af37, #c19b2e);
  color: #1a1a1a;
}

.bg-yellow-500:hover {
  background: linear-gradient(135deg, #c19b2e, #b8941f);
}

.bg-green-600 {
  background: rgba(34, 197, 94, 0.8);
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.3);
  backdrop-filter: blur(10px);
}

.bg-green-600:hover {
  background: rgba(34, 197, 94, 0.9);
  border-color: rgba(34, 197, 94, 0.6);
}

.bg-gray-600 {
  background: rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
  border: 1px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(10px);
}

.bg-gray-600:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #d4af37;
}

/* Classes utilitaires */
.font-bold { font-weight: bold; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.transition-colors { transition: all 0.3s ease; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.mt-8 { margin-top: 2rem; }
.flex { display: flex; }
.justify-center { justify-content: center; }

/* Responsivité */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .avatar-section {
    min-width: auto;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

/* Styles pour l'interactivité des cartes de statistiques */
.stat-card.interactive {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card.interactive:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(212, 175, 55, 0.3);
}

.stat-card.interactive.active {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
}

.stat-subtitle {
  font-size: 0.8em;
  color: #e0e0e0;
  margin-top: 5px;
}

.interaction-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.8em;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.stat-card.interactive:hover .interaction-indicator {
  opacity: 1;
  transform: scale(1.2);
}

/* Styles pour la popup d'édition du profil */

/* Overlay modal pour le popup d'édition */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-50px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.edit-profile-modal {
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  border: 2px solid #d4af37;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 90vw;
}

/* Bouton de fermeture du modal */
.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  color: #d4af37;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-close:hover {
  color: #fff;
  transform: scale(1.1);
}

.modal-title {
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Styles spécifiques pour la popup d'édition */
.edit-profile-modal .edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-profile-modal .edit-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-profile-modal .edit-label {
  font-weight: bold;
  color: #d4af37;
  font-size: 1.1em;
}

.edit-profile-modal .edit-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-profile-modal .edit-input {
  padding: 12px 16px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.edit-profile-modal .edit-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.3);
  background-color: rgba(255, 255, 255, 0.15);
}

.edit-profile-modal .edit-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-profile-modal .input-hint {
  font-size: 0.8em;
  color: #e0e0e0;
  opacity: 0.8;
}

/* Styles pour la section 2FA */
.edit-profile-modal .twofa-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.edit-profile-modal .twofa-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-profile-modal .twofa-indicator {
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.edit-profile-modal .twofa-indicator.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.edit-profile-modal .twofa-description {
  font-size: 0.9em;
  color: #e0e0e0;
  opacity: 0.8;
}

.edit-profile-modal .twofa-toggle-button {
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.edit-profile-modal .twofa-toggle-button:not(.active) {
  background: rgba(239, 68, 68, 0.8);
}

.edit-profile-modal .twofa-toggle-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.edit-profile-modal .twofa-toggle-button:not(.active):hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.edit-profile-modal .twofa-toggle-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Styles pour la section changement de mot de passe */
.edit-profile-modal .password-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.edit-profile-modal .password-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-profile-modal .password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.edit-profile-modal .password-input-container .edit-input {
  padding-right: 3rem;
  flex: 1;
}

.edit-profile-modal .password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 1.2em;
}

.edit-profile-modal .password-toggle:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.2);
  color: #f4d03f;
}

.edit-profile-modal .password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-profile-modal .password-change-button {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.edit-profile-modal .password-change-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.edit-profile-modal .password-change-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.edit-profile-modal .avatar-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-profile-modal .current-avatar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.edit-profile-modal .mini-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #d4af37;
  object-fit: cover;
}

.edit-profile-modal .avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.edit-profile-modal .upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #d4af37, #c19b2e);
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.9em;
}

.edit-profile-modal .upload-button:hover {
  background: linear-gradient(135deg, #c19b2e, #b8941f);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.edit-profile-modal .file-input {
  display: none;
}

.edit-profile-modal .upload-hint {
  font-size: 0.8em;
  color: #e0e0e0;
  opacity: 0.8;
  text-align: center;
}

.edit-profile-modal .avatar-reset {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.edit-profile-modal .reset-avatar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
}

.edit-profile-modal .reset-avatar-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.edit-profile-modal .reset-avatar-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive pour la popup d'édition */
@media (max-width: 768px) {
  .edit-profile-modal {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
    padding: 1.5rem;
    width: calc(100vw - 2rem);
  }
  
  .edit-profile-modal .edit-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .edit-profile-modal .btn-save,
  .edit-profile-modal .btn-reset {
    width: 100%;
    justify-content: center;
  }
}

/* Styles pour la section 2FA */
.twofa-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.twofa-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.twofa-indicator {
  font-weight: 600;
  font-size: 1.1rem;
}

.twofa-indicator.active {
  color: #10b981;
}

.twofa-description {
  color: #6b7280;
  font-size: 0.9rem;
}

.qr-code-section {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  animation: fadeIn 0.3s ease;
}

.qr-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.qr-code-image {
  max-width: 200px;
  height: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.qr-instructions {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.qr-instructions p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #1e293b;
}

.qr-instructions ol {
  margin: 0;
  padding-left: 1.2rem;
  color: #4b5563;
}

.qr-instructions li {
  margin-bottom: 0.3rem;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.verification-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  font-family: monospace;
  letter-spacing: 0.2em;
}

.verification-input:focus {
  border-color: #3b82f6;
  outline: none;
}

.verification-buttons {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}

.verify-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.verify-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.twofa-toggle-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.twofa-toggle-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.twofa-toggle-button.active {
  background: #ef4444;
}

.twofa-toggle-button.active:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.twofa-toggle-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
