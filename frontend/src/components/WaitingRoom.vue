<template>
  <div class="waiting-room">
    <!-- Header avec logo -->
    <header class="header">
      <div class="logo-section">
        <div class="bil        });
        break;
        
      case 'game-start':
        // Rediriger vers le jeu
        router.push({
          name: 'GamemultiOnline',
          query: {
            gameId: gameId.value,
            playerId: playerId.value
          }
        });
        break;
        
      case 'game-info':all"></div>
        <h1 class="logo-text">Pong Billard</h1>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="main-content">
      <div class="content-container">
        <!-- En-tête de la page -->
        <div class="page-header">
          <h1 class="main-title">Salle d'attente</h1>
          <p class="subtitle">En attente de joueurs pour commencer la partie</p>
        </div>

        <!-- Carte de la partie -->
        <div class="game-card">
          <div class="game-info">
            <div class="game-id-section">
              <h3 class="section-title">🎮 ID de la partie</h3>
              <div class="game-id-display">
                <span class="game-id-value">{{ gameId || 'UNKNOWN' }}</span>
                <button @click="copyGameId" class="copy-button" :class="{ 'copied': gameIdCopied }">
                  <svg v-if="!gameIdCopied" class="copy-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                  </svg>
                  <span v-else>✓</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Section des joueurs -->
          <div class="players-section">
            <h3 class="section-title">👥 Joueurs connectés ({{ connectedPlayers.length }}/{{ maxPlayers }})</h3>
            <div class="players-grid">
              <div 
                v-for="player in allPlayerSlots" 
                :key="player.id"
                class="player-slot"
                :class="{ 'connected': player.connected, 'current-user': player.isCurrentUser }"
              >
                <div class="player-avatar">
                  <div v-if="player.connected" class="avatar-image">
                    {{ player.username ? player.username.charAt(0).toUpperCase() : '?' }}
                  </div>
                  <div v-else class="empty-slot">
                    <svg class="waiting-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div class="player-info">
                  <span class="player-name">
                    {{ player.connected ? player.username : 'En attente...' }}
                  </span>
                  <span v-if="player.isCurrentUser" class="current-user-badge">Vous</span>
                  <span v-if="player.connected" class="status-badge connected">Connecté</span>
                  <span v-else class="status-badge waiting">En attente</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message de statut -->
          <div class="status-message">
            <div v-if="connectedPlayers.length < maxPlayers" class="waiting-message">
              <p>En attente de {{ maxPlayers - connectedPlayers.length }} joueur(s) supplémentaire(s)...</p>
              <p class="instruction-text">Partagez l'ID de la partie avec vos amis pour qu'ils puissent vous rejoindre</p>
            </div>
            <div v-else class="ready-message">
              <div class="ready-icon">🎉</div>
              <p>Tous les joueurs sont connectés !</p>
              <p class="instruction-text">La partie va commencer dans quelques secondes...</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bouton retour en bas de page -->
    <footer class="footer">
      <button @click="goBack" class="back-button">
        <svg class="back-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path>
        </svg>
        Quitter la partie
      </button>
    </footer>

    <!-- Décoration avec boules de billard -->
    <div class="billiard-decoration">
      <div class="billiard-ball ball-1 floating" style="top: 15%; left: 8%;"></div>
      <div class="billiard-ball ball-2 floating" style="top: 25%; right: 12%;"></div>
      <div class="billiard-ball ball-3 floating" style="top: 60%; left: 5%;"></div>
      <div class="billiard-ball ball-4 floating" style="top: 70%; right: 8%;"></div>
      <div class="billiard-ball ball-5 floating" style="top: 40%; left: 3%;"></div>
      <div class="billiard-ball ball-1 floating" style="top: 80%; right: 15%;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { connectSocket, sendMessage as sendWsMessage, setOnMessage } from '../services/websocket';

const router = useRouter();
const route = useRoute();

// État de la salle d'attente
const gameId = ref<string | null>(null);
const playerId = ref<string | null>(null);
const maxPlayers = ref<number>(2);
const connectedPlayers = ref<Array<{ id: string, username: string }>>([]);
const gameIdCopied = ref(false);
const currentUsername = ref('');

// Récupération des paramètres de la route
onMounted(() => {
  gameId.value = route.query.id as string || null;
  playerId.value = route.query.playerId as string || null;
  
  // Récupérer le nom d'utilisateur actuel
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  currentUsername.value = userData.username || 'Joueur';
  
  // Connexion WebSocket
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  connectSocket(`${protocol}://${host}/ws/`);

  // Configuration des événements WebSocket
  setOnMessage((data: any) => {
    console.log('[WaitingRoom] Message reçu:', data);
    
    switch (data.type) {
      case 'player-joined':
        const { playerId: newPlayerId, username } = data.payload;
        if (!connectedPlayers.value.find(p => p.id === newPlayerId)) {
          connectedPlayers.value.push({ id: newPlayerId, username });
        }
        break;
        
      case 'player-left':
        const { playerId: leftPlayerId } = data.payload;
        const leftPlayer = connectedPlayers.value.find(p => p.id === leftPlayerId);
        if (leftPlayer) {
          connectedPlayers.value = connectedPlayers.value.filter(p => p.id !== leftPlayerId);
        }
        break;
        
      case 'game-start':
        // Rediriger vers le jeu
        router.push({
          name: 'GamemultiOnline',
          query: {
            gameId: gameId.value,
            playerId: playerId.value
          }
        });
        break;
        
      case 'game-info':
        const { players, maxPlayers: max } = data.payload;
        maxPlayers.value = max || 2;
        connectedPlayers.value = players || [];
        break;
        
      case 'error':
        console.error('[WaitingRoom] Erreur:', data.payload.message);
        // Gérer les erreurs (partie introuvable, etc.)
        if (data.payload.message.includes('not found')) {
          router.push({ name: 'CreateOrJoin' });
        }
        break;
    }
  });

  // Demander les informations de la partie
  if (gameId.value && playerId.value) {
    sendWsMessage('get-game-info', {
      gameId: gameId.value,
      playerId: playerId.value
    });
  }
});

onUnmounted(() => {
  // Quitter la partie lors de la fermeture du composant
  if (gameId.value && playerId.value) {
    sendWsMessage('leave-game', {
      gameId: gameId.value,
      playerId: playerId.value
    });
  }
});

// Computed pour générer les slots des joueurs
const allPlayerSlots = computed(() => {
  const slots = [];
  
  for (let i = 0; i < maxPlayers.value; i++) {
    const player = connectedPlayers.value[i];
    if (player) {
      slots.push({
        id: player.id,
        username: player.username,
        connected: true,
        isCurrentUser: player.id === playerId.value
      });
    } else {
      slots.push({
        id: `empty-${i}`,
        username: '',
        connected: false,
        isCurrentUser: false
      });
    }
  }
  
  return slots;
});

// Fonctions
function goBack() {
  if (gameId.value && playerId.value) {
    sendWsMessage('leave-game', {
      gameId: gameId.value,
      playerId: playerId.value
    });
  }
  router.push({ name: 'CreateOrJoin' });
}

async function copyGameId() {
  if (!gameId.value) return;
  
  try {
    await navigator.clipboard.writeText(gameId.value);
    gameIdCopied.value = true;
    setTimeout(() => {
      gameIdCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
  }
}
</script>

<style scoped>
.waiting-room {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  color: #f8f9fa;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  position: relative;
  z-index: 10;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.content-container {
  max-width: 800px;
  width: 100%;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 3rem;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.subtitle {
  font-size: 1.2rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

/* Game Card */
.game-card {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.game-info {
  margin-bottom: 2rem;
}

.section-title {
  color: #d4af37;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

/* Game ID Section */
.game-id-section {
  text-align: center;
  margin-bottom: 2rem;
}

.game-id-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.game-id-value {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: #d4af37;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.copy-button {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid #d4af37;
  border-radius: 0.5rem;
  color: #d4af37;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  background: rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
}

.copy-button.copied {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #10b981;
}

.copy-icon {
  width: 20px;
  height: 20px;
}

/* Players Section */
.players-section {
  margin-bottom: 2rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.player-slot {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.player-slot.connected {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}

.player-slot.current-user {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.player-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #c19b2e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
}

.empty-slot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.waiting-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.5);
  animation: pulse 2s infinite;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8f9fa;
}

.current-user-badge {
  font-size: 0.8rem;
  background: #d4af37;
  color: #1a1a1a;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-badge {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-badge.connected {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.waiting {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Status Message */
.status-message {
  text-align: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.waiting-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.waiting-message p {
  margin: 0;
  font-size: 1.1rem;
  color: #e0e0e0;
}

.instruction-text {
  font-size: 0.9rem !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-style: italic;
}

.ready-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.ready-message p {
  margin: 0;
  font-size: 1.2rem;
  color: #22c55e;
  font-weight: 600;
}

.ready-icon {
  font-size: 3rem;
  animation: bounce 1s infinite;
}

/* Footer */
.footer {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #ef4444;
  border-radius: 0.5rem;
  color: #ef4444;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.back-icon {
  width: 20px;
  height: 20px;
}

/* Billiard Decoration */
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

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-10px); }
  70% { transform: translateY(-5px); }
  90% { transform: translateY(-2px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .game-card {
    padding: 1.5rem;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .game-id-display {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 2rem;
  }
  
  .game-card {
    padding: 1rem;
  }
  
  .logo-text {
    font-size: 1.2rem;
  }
  
  .back-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .game-id-value {
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
  }
}
</style>
