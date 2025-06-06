<template>
  <div class="tournament-container">
    <!-- Header -->
    <div class="tournament-header">
      <h1 class="tournament-title">TOURNOI PONG</h1>
      <p class="tournament-subtitle">Bracket 8 Joueurs - Multijoueur Local</p>
    </div>

    <!-- Setup Section -->
    <div v-if="!tournamentStarted" class="setup-section">
      <h2 class="setup-title">Configuration des Joueurs</h2>
      <div class="players-grid">
        <div v-for="(player, index) in playerNames" :key="index" class="player-input-group">
          <label :for="'player' + index">Joueur {{ index + 1 }}:</label>
          <input 
            :id="'player' + index"
            v-model="playerNames[index]"
            type="text" 
            class="player-input" 
            :placeholder="'Nom du joueur ' + (index + 1)"
          >
        </div>
      </div>
      <button 
        @click="startTournament" 
        :disabled="!canStartTournament" 
        class="start-tournament-btn"
      >
        🏆 Commencer le Tournoi
      </button>
    </div>

    <!-- Bracket -->
    <div v-if="tournamentStarted" class="bracket-container">
      <!-- Côté gauche - Quarts de finale -->
      <div class="bracket-side left-side">
        <div class="round round-1">
          <div class="match" v-for="(match, index) in leftQuarterFinals" :key="'left-qf-' + index">
            <div class="team-container">
              <div 
                :class="['team', { 'winner': match.team1.isWinner, 'clickable': !match.isCompleted }]"
                @click="selectWinner(match, 1)"
              >
                {{ match.team1.name }}
              </div>
              <div 
                :class="['team', { 'winner': match.team2.isWinner, 'clickable': !match.isCompleted }]"
                @click="selectWinner(match, 2)"
              >
                {{ match.team2.name }}
              </div>
              <button 
                v-if="!match.isCompleted" 
                @click="launchPongGame(match)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
            </div>
            <div class="connector-right"></div>
          </div>
        </div>

        <!-- Demi-finale gauche -->
        <div class="round round-2">
          <div class="match">
            <div class="team-container">
              <div 
                :class="['team', { 'winner': leftSemiFinal.team1.isWinner, 'clickable': !leftSemiFinal.isCompleted && leftSemiFinal.team1.name }]"
                @click="leftSemiFinal.team1.name && selectWinner(leftSemiFinal, 1)"
              >
                {{ leftSemiFinal.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team', { 'winner': leftSemiFinal.team2.isWinner, 'clickable': !leftSemiFinal.isCompleted && leftSemiFinal.team2.name }]"
                @click="leftSemiFinal.team2.name && selectWinner(leftSemiFinal, 2)"
              >
                {{ leftSemiFinal.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!leftSemiFinal.isCompleted && leftSemiFinal.team1.name && leftSemiFinal.team2.name" 
                @click="launchPongGame(leftSemiFinal)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
            </div>
            <div class="connector-right"></div>
          </div>
        </div>
      </div>

      <!-- Centre - Finale -->
      <div class="bracket-center">
        <div class="final-section">
          <h2 class="final-title">JOUEUR<br>GAGNANT</h2>
          
          <div class="final-match">
            <div class="team-container final-teams">
              <div 
                :class="['team final-team', { 'winner': finalMatch.team1.isWinner, 'clickable': !finalMatch.isCompleted && finalMatch.team1.name }]"
                @click="finalMatch.team1.name && selectWinner(finalMatch, 1)"
              >
                {{ finalMatch.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team final-team', { 'winner': finalMatch.team2.isWinner, 'clickable': !finalMatch.isCompleted && finalMatch.team2.name }]"
                @click="finalMatch.team2.name && selectWinner(finalMatch, 2)"
              >
                {{ finalMatch.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!finalMatch.isCompleted && finalMatch.team1.name && finalMatch.team2.name" 
                @click="launchPongGame(finalMatch)"
                class="play-pong-btn final-pong-btn"
              >
                🏓 FINALE PONG
              </button>
            </div>
          </div>

          <!-- Champion -->
          <div v-if="champion" class="champion-section">
            <div class="trophy">🏆</div>
            <div class="champion-name">{{ champion }}</div>
            <div class="champion-subtitle">Champion du Tournoi !</div>
            <button @click="resetTournament" class="reset-btn">🔄 Nouveau Tournoi</button>
          </div>
        </div>
      </div>

      <!-- Côté droit -->
      <div class="bracket-side right-side">
        <!-- Demi-finale droite -->
        <div class="round round-2">
          <div class="match">
            <div class="connector-left"></div>
            <div class="team-container">
              <div 
                :class="['team', { 'winner': rightSemiFinal.team1.isWinner, 'clickable': !rightSemiFinal.isCompleted && rightSemiFinal.team1.name }]"
                @click="rightSemiFinal.team1.name && selectWinner(rightSemiFinal, 1)"
              >
                {{ rightSemiFinal.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team', { 'winner': rightSemiFinal.team2.isWinner, 'clickable': !rightSemiFinal.isCompleted && rightSemiFinal.team2.name }]"
                @click="rightSemiFinal.team2.name && selectWinner(rightSemiFinal, 2)"
              >
                {{ rightSemiFinal.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!rightSemiFinal.isCompleted && rightSemiFinal.team1.name && rightSemiFinal.team2.name" 
                @click="launchPongGame(rightSemiFinal)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
            </div>
          </div>
        </div>

        <!-- Quarts de finale droite -->
        <div class="round round-1">
          <div class="match" v-for="(match, index) in rightQuarterFinals" :key="'right-qf-' + index">
            <div class="connector-left"></div>
            <div class="team-container">
              <div 
                :class="['team', { 'winner': match.team1.isWinner, 'clickable': !match.isCompleted }]"
                @click="selectWinner(match, 1)"
              >
                {{ match.team1.name }}
              </div>
              <div 
                :class="['team', { 'winner': match.team2.isWinner, 'clickable': !match.isCompleted }]"
                @click="selectWinner(match, 2)"
              >
                {{ match.team2.name }}
              </div>
              <button 
                v-if="!match.isCompleted" 
                @click="launchPongGame(match)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <p v-if="!tournamentStarted">🎮 <strong>Instructions :</strong> Entrez les noms des 8 joueurs pour commencer le tournoi</p>
      <p v-else>🎮 <strong>Instructions :</strong> Cliquez sur un joueur pour le faire gagner ou sur "Jouer Pong" pour lancer un match</p>
      <p>🏓 <strong>Pong :</strong> Cliquez sur "Jouer Pong" pour lancer un match entre deux joueurs</p>
      <p>👥 <strong>Multijoueur Local :</strong> Les deux joueurs jouent à tour de rôle sur le même écran</p>
    </div>

    <!-- Progression du tournoi -->
    <div v-if="tournamentStarted" class="tournament-progress">
      <h3>📊 Progression du Tournoi</h3>
      <div class="progress-stats">
        <div class="stat">
          <span class="stat-label">Quarts de finale :</span>
          <span class="stat-value">{{ completedQuarterFinals }}/4</span>
        </div>
        <div class="stat">
          <span class="stat-label">Demi-finales :</span>
          <span class="stat-value">{{ completedSemiFinals }}/2</span>
        </div>
        <div class="stat">
          <span class="stat-label">Finale :</span>
          <span class="stat-value">{{ finalMatch.isCompleted ? '1/1' : '0/1' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Team {
  name: string
  isWinner: boolean
}

interface Match {
  team1: Team
  team2: Team
  isCompleted: boolean
  winner?: Team
}

// État de configuration
const tournamentStarted = ref(false)
const playerNames = ref<string[]>(Array(8).fill(''))

// Noms par défaut pour tester rapidement
const defaultNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 
  'Eve', 'Frank', 'Grace', 'Henry'
]

// Computed pour vérifier si on peut commencer le tournoi
const canStartTournament = computed(() => {
  const filledNames = playerNames.value.filter(name => name.trim() !== '')
  const uniqueNames = new Set(filledNames.map(name => name.trim()))
  return filledNames.length === 8 && uniqueNames.size === 8
})

// État du tournoi
const leftQuarterFinals = ref<Match[]>([])
const rightQuarterFinals = ref<Match[]>([])
const leftSemiFinal = ref<Match>({
  team1: { name: '', isWinner: false },
  team2: { name: '', isWinner: false },
  isCompleted: false
})
const rightSemiFinal = ref<Match>({
  team1: { name: '', isWinner: false },
  team2: { name: '', isWinner: false },
  isCompleted: false
})
const finalMatch = ref<Match>({
  team1: { name: '', isWinner: false },
  team2: { name: '', isWinner: false },
  isCompleted: false
})

// Champion
const champion = computed(() => {
  if (finalMatch.value.isCompleted) {
    return finalMatch.value.winner?.name || ''
  }
  return ''
})

// Statistiques de progression
const completedQuarterFinals = computed(() => {
  return [...leftQuarterFinals.value, ...rightQuarterFinals.value]
    .filter(match => match.isCompleted).length
})

const completedSemiFinals = computed(() => {
  let count = 0
  if (leftSemiFinal.value.isCompleted) count++
  if (rightSemiFinal.value.isCompleted) count++
  return count
})

// Remplir automatiquement avec des noms par défaut
const fillDefaultNames = () => {
  playerNames.value = [...defaultNames]
}

// Commencer le tournoi
const startTournament = () => {
  if (!canStartTournament.value) {
    alert('Veuillez entrer 8 noms de joueurs uniques')
    return
  }
  
  tournamentStarted.value = true
  initializeTournament()
}

// Initialiser le tournoi
const initializeTournament = () => {
  const names = playerNames.value.map(name => name.trim())
  
  // Quarts de finale gauche (2 matchs)
  leftQuarterFinals.value = [
    {
      team1: { name: names[0], isWinner: false },
      team2: { name: names[1], isWinner: false },
      isCompleted: false
    },
    {
      team1: { name: names[2], isWinner: false },
      team2: { name: names[3], isWinner: false },
      isCompleted: false
    }
  ]

  // Quarts de finale droite (2 matchs)
  rightQuarterFinals.value = [
    {
      team1: { name: names[4], isWinner: false },
      team2: { name: names[5], isWinner: false },
      isCompleted: false
    },
    {
      team1: { name: names[6], isWinner: false },
      team2: { name: names[7], isWinner: false },
      isCompleted: false
    }
  ]

  // Réinitialiser les demi-finales et finale
  leftSemiFinal.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false
  }

  rightSemiFinal.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false
  }

  finalMatch.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false
  }
}

// Lancer le jeu Pong (simulation)
const launchPongGame = (match: Match) => {
  router.push({
    name: 'tournamentgame', // doit correspondre au name de ta route dans router.ts
    query: {
      player1: match.team1.name,
      player2: match.team2.name,
    }
  })
}

// Sélectionner un gagnant
const selectWinner = (match: Match, teamNumber: 1 | 2) => {
  if (match.isCompleted) return

  // Réinitialiser les gagnants
  match.team1.isWinner = false
  match.team2.isWinner = false

  // Définir le gagnant
  if (teamNumber === 1) {
    match.team1.isWinner = true
    match.winner = match.team1
  } else {
    match.team2.isWinner = true
    match.winner = match.team2
  }

  match.isCompleted = true

  // Avancer le gagnant au tour suivant
  advanceWinner(match)
}

// Faire avancer le gagnant
const advanceWinner = (match: Match) => {
  if (!match.winner) return

  // Trouver d'où vient ce match et où envoyer le gagnant
  const leftQFIndex = leftQuarterFinals.value.indexOf(match)
  const rightQFIndex = rightQuarterFinals.value.indexOf(match)

  if (leftQFIndex !== -1) {
    // Quart de finale gauche -> demi-finale gauche
    if (leftQFIndex === 0) {
      leftSemiFinal.value.team1 = { ...match.winner }
    } else {
      leftSemiFinal.value.team2 = { ...match.winner }
    }
  } else if (rightQFIndex !== -1) {
    // Quart de finale droite -> demi-finale droite
    if (rightQFIndex === 0) {
      rightSemiFinal.value.team1 = { ...match.winner }
    } else {
      rightSemiFinal.value.team2 = { ...match.winner }
    }
  } else if (match === leftSemiFinal.value) {
    // Demi-finale gauche -> finale
    finalMatch.value.team1 = { ...match.winner }
  } else if (match === rightSemiFinal.value) {
    // Demi-finale droite -> finale
    finalMatch.value.team2 = { ...match.winner }
  }
}

// Réinitialiser le tournoi
const resetTournament = () => {
  tournamentStarted.value = false
  playerNames.value = Array(8).fill('')
}

// Initialisation
onMounted(() => {
  // Remplir automatiquement pour les tests
  if (import.meta.env.DEV) {
    fillDefaultNames()
  }
})
</script> 

<style scoped>
.tournament-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.tournament-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  border: 3px solid #d4af37;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.tournament-title {
  font-size: 3rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
}

.tournament-subtitle {
  font-size: 1.2rem;
  color: #bbf7d0;
  margin: 0;
}

.setup-section {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #d4af37;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.setup-title {
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.player-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-input-group label {
  color: #bbf7d0;
  font-weight: 600;
}

.player-input {
  padding: 0.75rem;
  border: 2px solid #d4af37;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #1a472a;
  font-weight: 600;
}

.player-input:focus {
  outline: none;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.start-tournament-btn {
  background: #d4af37;
  color: #1a472a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
}

.start-tournament-btn:hover:not(:disabled) {
  background: #b8941f;
  transform: translateY(-2px);
}

.start-tournament-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
}

.bracket-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  border: 2px solid #d4af37;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.bracket-side {
  display: flex;
  gap: 3rem;
}

.left-side {
  justify-content: flex-end;
}

.right-side {
  justify-content: flex-start;
}

.round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-height: 400px;
}

.round-1 {
  gap: 2rem;
}

.round-2 {
  justify-content: center;
}

.match {
  display: flex;
  align-items: center;
  position: relative;
}

.team-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  margin-bottom: 3rem;
}

.team {
  background: white;
  color: #1a472a;
  padding: 0.75rem 1.5rem;
  border: 2px solid #d4af37;
  font-weight: 600;
  min-width: 150px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.team.clickable {
  cursor: pointer;
}

.team.clickable:hover {
  background: #f0f9ff;
  transform: scale(1.02);
}

.team.winner {
  background: #d4af37;
  color: #1a472a;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.team:first-child {
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
}

.team:last-child {
  border-top: 1px solid #d4af37;
  border-radius: 0 0 0.5rem 0.5rem;
}

.final-team {
  min-width: 200px;
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
}

.play-pong-btn {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: absolute;
  bottom: -2.5rem;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.play-pong-btn:hover {
  background: #16a34a;
  transform: translateX(-50%) scale(1.05);
}

.final-pong-btn {
  background: #d4af37;
  color: #1a472a;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
}

.final-pong-btn:hover {
  background: #b8941f;
}

.connector-right, .connector-left {
  width: 30px;
  height: 2px;
  background: #d4af37;
  position: relative;
}

.connector-right::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid #d4af37;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.connector-left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-right: 8px solid #d4af37;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.bracket-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
}

.final-section {
  text-align: center;
}

.final-title {
  font-size: 2rem;
  font-weight: bold;
  color: #d4af37;
  margin: 0 0 2rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.final-teams {
  margin-bottom: 2rem;
}

.champion-section {
  margin-top: 2rem;
}

.trophy {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.champion-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.champion-subtitle {
  font-size: 1.2rem;
  color: #bbf7d0;
  margin-bottom: 1.5rem;
}

.reset-btn {
  background: #d4af37;
  color: #1a472a;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: #b8941f;
  transform: translateY(-2px);
}

.tournament-progress {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 2rem;
  backdrop-filter: blur(10px);
}

.tournament-progress h3 {
  color: #d4af37;
  margin: 0 0 1rem 0;
  text-align: center;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.stat-label {
  color: #bbf7d0;
}

.stat-value {
  color: #d4af37;
  font-weight: bold;
}

.instructions {
  text-align: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(10px);
}

.instructions p {
  color: #bbf7d0;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .bracket-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .bracket-side {
    justify-content: center;
  }
  
  .tournament-title {
    font-size: 2rem;
  }
  
  .team {
    min-width: 120px;
    padding: 0.5rem 1rem;
  }

  .players-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .tournament-container {
    padding: 1rem;
  }
  
  .round {
    min-height: 300px;
  }
  
  .team {
    min-width: 100px;
    font-size: 0.9rem;
  }
  
  .final-title {
    font-size: 1.5rem;
  }

  .players-grid {
    grid-template-columns: 1fr;
  }

  .team-container {
    margin-bottom: 3rem;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }
}
</style>