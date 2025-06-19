<template>
  <div class="create-container">
    <h1>{{ $t('createGameTitle') }}</h1>

    <div v-if="!gameId">
      <label for="playersCount">{{ $t('choosePlayersCount') }}</label>
      <!-- v-model.number force playersCount à rester un Number -->
      <select
        id="playersCount"
        v-model.number="playersCount"
        class="select-count"
      >
        <option :value="2">2 {{ $t('players') }}</option>
        <option :value="4">4 {{ $t('players') }}</option>
      </select>
      <button @click="create" class="btn btn-create">
        {{ $t('createBtn') }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <div v-else class="created-info">
      <p>
        {{ $t('gameCreatedId') }} <strong>{{ gameId }}</strong>
      </p>
      <button @click="goWaiting" class="btn btn-waiting">
        {{ $t('goToWaiting') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { connectSocket, sendMessage, setOnMessage } from '../services/websocket';

const router       = useRouter();
const playersCount = ref<number>(2);
const gameId       = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// Récupération du nom d'utilisateur
const username = ref('');
const parsedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
username.value = parsedUser.username || 'Invité';

function getWsUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/`;
}

onMounted(() => {
  console.log('[CreateGame] Nom d\'utilisateur:', username.value);
  const socket = connectSocket(getWsUrl());

  socket.addEventListener('open', () => {
    console.log('[CreateGame] Socket connecté');
  });

  setOnMessage(data => {
    console.log('[CreateGame] Message reçu:', data);
    if (data.type === 'game-created') {
      gameId.value = data.payload.gameId;
      console.log('[CreateGame] Partie créée avec ID:', gameId.value);
    }
    if (data.type === 'error') {
      errorMessage.value = data.payload.message || 'Erreur inconnue';
    }
  });
});

function create() {
  console.log('[CreateGame] Création de partie avec', playersCount.value, 'joueurs pour', username.value);
  errorMessage.value = null;
  
  // MODIFICATION: Envoi du nom d'utilisateur avec la requête de création
  sendMessage('create-game', { 
    maxPlayers: playersCount.value,
    username: username.value
  });
}

function goWaiting() {
  if (!gameId.value) return;
  router.push({
    name: 'WaitingRoom',
    query: {
      id:       gameId.value,
      playerId: 'player1'
    }
  });
}
</script>

<style scoped>
/* vos styles existants… */
.create-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #f8f9fa;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  color: #d4af37;
  margin-bottom: 2rem;
}

.select-count {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 2px solid #d4af37;
  background-color: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  margin: 1rem 0;
  width: 200px;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease-in-out;
  margin: 0.5rem;
}

.btn-create {
  background-color: #ff9800;
}

.btn-create:hover {
  background-color: #fb8c00;
}

.btn-waiting {
  background-color: #4caf50;
}

.btn-waiting:hover {
  background-color: #388e3c;
}

.error {
  color: #ff5252;
  margin-top: 1rem;
}

.created-info {
  text-align: center;
}

.created-info p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #d4af37;
}
</style>