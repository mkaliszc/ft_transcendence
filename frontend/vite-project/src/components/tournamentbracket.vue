<template>
  <div class="tournament-container">
    <!-- Header -->
    <div class="tournament-header">
      <button @click="goBack" class="back-button">
        ← Retour à la configuration
      </button>
      <div class="header-content">
        <h1 class="tournament-title">BRACKET TOURNOI</h1>
        <p class="tournament-subtitle">Tournoi à élimination directe - 8 Joueurs</p>
      </div>
      <button @click="resetTournament" class="reset-button">
        🔄 Nouveau Tournoi
      </button>
    </div>

    <!-- Bracket -->
    <div class="bracket-container">
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
                :class="['team', { 
                  'winner': leftSemiFinal.team1.isWinner, 
                  'clickable': canPlaySemiFinal(leftSemiFinal) && leftSemiFinal.team1.name,
                  'disabled': !canPlaySemiFinal(leftSemiFinal)
                }]"
                @click="leftSemiFinal.team1.name && canPlaySemiFinal(leftSemiFinal) && selectWinner(leftSemiFinal, 1)"
              >
                {{ leftSemiFinal.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team', { 
                  'winner': leftSemiFinal.team2.isWinner, 
                  'clickable': canPlaySemiFinal(leftSemiFinal) && leftSemiFinal.team2.name,
                  'disabled': !canPlaySemiFinal(leftSemiFinal)
                }]"
                @click="leftSemiFinal.team2.name && canPlaySemiFinal(leftSemiFinal) && selectWinner(leftSemiFinal, 2)"
              >
                {{ leftSemiFinal.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!leftSemiFinal.isCompleted && leftSemiFinal.team1.name && leftSemiFinal.team2.name && canPlaySemiFinal(leftSemiFinal)" 
                @click="launchPongGame(leftSemiFinal)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
              <div v-else-if="!canPlaySemiFinal(leftSemiFinal)" class="waiting-message">
                Terminez tous les quarts de finale
              </div>
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
                :class="['team final-team', { 
                  'winner': finalMatch.team1.isWinner, 
                  'clickable': canPlayFinal() && finalMatch.team1.name,
                  'disabled': !canPlayFinal()
                }]"
                @click="finalMatch.team1.name && canPlayFinal() && selectWinner(finalMatch, 1)"
              >
                {{ finalMatch.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team final-team', { 
                  'winner': finalMatch.team2.isWinner, 
                  'clickable': canPlayFinal() && finalMatch.team2.name,
                  'disabled': !canPlayFinal()
                }]"
                @click="finalMatch.team2.name && canPlayFinal() && selectWinner(finalMatch, 2)"
              >
                {{ finalMatch.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!finalMatch.isCompleted && finalMatch.team1.name && finalMatch.team2.name && canPlayFinal()" 
                @click="launchPongGame(finalMatch)"
                class="play-pong-btn final-pong-btn"
              >
                🏓 FINALE PONG
              </button>
              <div v-else-if="!canPlayFinal()" class="waiting-message">
                Terminez toutes les demi-finales
              </div>
            </div>
          </div>

          <!-- Champion -->
          <div v-if="champion" class="champion-section">
            <div class="trophy">🏆</div>
            <div class="champion-name">{{ champion }}</div>
            <div class="champion-subtitle">Champion du Tournoi !</div>
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
                :class="['team', { 
                  'winner': rightSemiFinal.team1.isWinner, 
                  'clickable': canPlaySemiFinal(rightSemiFinal) && rightSemiFinal.team1.name,
                  'disabled': !canPlaySemiFinal(rightSemiFinal)
                }]"
                @click="rightSemiFinal.team1.name && canPlaySemiFinal(rightSemiFinal) && selectWinner(rightSemiFinal, 1)"
              >
                {{ rightSemiFinal.team1.name || 'En attente' }}
              </div>
              <div 
                :class="['team', { 
                  'winner': rightSemiFinal.team2.isWinner, 
                  'clickable': canPlaySemiFinal(rightSemiFinal) && rightSemiFinal.team2.name,
                  'disabled': !canPlaySemiFinal(rightSemiFinal)
                }]"
                @click="rightSemiFinal.team2.name && canPlaySemiFinal(rightSemiFinal) && selectWinner(rightSemiFinal, 2)"
              >
                {{ rightSemiFinal.team2.name || 'En attente' }}
              </div>
              <button 
                v-if="!rightSemiFinal.isCompleted && rightSemiFinal.team1.name && rightSemiFinal.team2.name && canPlaySemiFinal(rightSemiFinal)" 
                @click="launchPongGame(rightSemiFinal)"
                class="play-pong-btn"
              >
                🏓 Jouer Pong
              </button>
              <div v-else-if="!canPlaySemiFinal(rightSemiFinal)" class="waiting-message">
                Terminez tous les quarts de finale
              </div>
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
      <p>🎮 <strong>Instructions :</strong> Cliquez sur un joueur pour le faire gagner ou sur "Jouer Pong" pour lancer un match</p>
      <p>🏓 <strong>Pong :</strong> Cliquez sur "Jouer Pong" pour lancer un match entre deux joueurs</p>
      <p>⚠️ <strong>Important :</strong> Terminez tous les matchs d'un tour avant de passer au suivant</p>
    </div>

    <!-- Progression du tournoi -->
    <div class="tournament-progress">
      <h3>📊 Progression du Tournoi</h3>
      <div class="progress-stats">
        <div class="stat" :class="{ 'completed': completedQuarterFinals === 4 }">
          <span class="stat-label">Quarts de finale :</span>
          <span class="stat-value">{{ completedQuarterFinals }}/4</span>
        </div>
        <div class="stat" :class="{ 'completed': completedSemiFinals === 2, 'available': completedQuarterFinals === 4 }">
          <span class="stat-label">Demi-finales :</span>
          <span class="stat-value">{{ completedSemiFinals }}/2</span>
        </div>
        <div class="stat" :class="{ 'completed': finalMatch.isCompleted, 'available': completedSemiFinals === 2 }">
          <span class="stat-label">Finale :</span>
          <span class="stat-value">{{ finalMatch.isCompleted ? '1/1' : '0/1' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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

// Fonctions de sauvegarde et chargement de l'état
const saveTournamentState = () => {
  const state = {
    leftQuarterFinals: leftQuarterFinals.value,
    rightQuarterFinals: rightQuarterFinals.value,
    leftSemiFinal: leftSemiFinal.value,
    rightSemiFinal: rightSemiFinal.value,
    finalMatch: finalMatch.value,
    players: route.query.players
  }
  localStorage.setItem('tournament_state', JSON.stringify(state))
}

const loadTournamentState = () => {
  const saved = localStorage.getItem('tournament_state')
  if (saved) {
    try {
      const state = JSON.parse(saved)
      
      // Vérifier que les données sont valides
      if (state.leftQuarterFinals && state.rightQuarterFinals) {
        leftQuarterFinals.value = state.leftQuarterFinals
        rightQuarterFinals.value = state.rightQuarterFinals
        leftSemiFinal.value = state.leftSemiFinal || { team1: { name: '', isWinner: false }, team2: { name: '', isWinner: false }, isCompleted: false }
        rightSemiFinal.value = state.rightSemiFinal || { team1: { name: '', isWinner: false }, team2: { name: '', isWinner: false }, isCompleted: false }
        finalMatch.value = state.finalMatch || { team1: { name: '', isWinner: false }, team2: { name: '', isWinner: false }, isCompleted: false }
        return true
      }
    } catch (e) {
      console.error('Erreur lors du chargement de l\'état du tournoi:', e)
      localStorage.removeItem('tournament_state')
    }
  }
  return false
}

// Fonctions de validation
const canPlaySemiFinal = (semiFinal: Match) => {
  // On peut jouer une demi-finale seulement si tous les quarts de finale sont terminés
  return completedQuarterFinals.value === 4 && 
         semiFinal.team1.name && 
         semiFinal.team2.name && 
         !semiFinal.isCompleted
}

const canPlayFinal = () => {
  // On peut jouer la finale seulement si toutes les demi-finales sont terminées
  return completedSemiFinals.value === 2 && 
         finalMatch.value.team1.name && 
         finalMatch.value.team2.name && 
         !finalMatch.value.isCompleted
}

// Gestion du retour du jeu Pong
const handleGameResult = () => {
  const winner = route.query.winner as string
  const player1 = route.query.player1 as string
  const player2 = route.query.player2 as string
  
  if (winner && player1 && player2) {
    console.log('Retour du jeu avec gagnant:', winner)
    
    // Trouver le match correspondant
    const allMatches = [
      ...leftQuarterFinals.value,
      ...rightQuarterFinals.value,
      leftSemiFinal.value,
      rightSemiFinal.value,
      finalMatch.value
    ]
    
    const match = allMatches.find(m => 
      (m.team1.name === player1 && m.team2.name === player2) ||
      (m.team1.name === player2 && m.team2.name === player1)
    )
    
    if (match && !match.isCompleted) {
      console.log('Match trouvé, application du résultat')
      if (winner === match.team1.name) {
        selectWinner(match, 1)
      } else if (winner === match.team2.name) {
        selectWinner(match, 2)
      }
    }
    
    // Nettoyer les paramètres de l'URL mais garder les joueurs
    router.replace({ 
      name: route.name || 'tournament-bracket',
      query: { players: route.query.players } 
    })
  }
}

// Initialiser le tournoi avec les joueurs
const initializeTournament = (playerNames: string[]) => {
  if (playerNames.length !== 8) {
    router.push({ name: 'tournament-setup' })
    return
  }

  // Essayer de charger l'état sauvegardé d'abord
  if (loadTournamentState()) {
    console.log('État du tournoi chargé depuis localStorage')
    return
  }

  console.log('Initialisation d\'un nouveau tournoi')
  
  // Sinon, initialiser un nouveau tournoi
  leftQuarterFinals.value = [
    {
      team1: { name: playerNames[0], isWinner: false },
      team2: { name: playerNames[1], isWinner: false },
      isCompleted: false
    },
    {
      team1: { name: playerNames[2], isWinner: false },
      team2: { name: playerNames[3], isWinner: false },
      isCompleted: false
    }
  ]

  rightQuarterFinals.value = [
    {
      team1: { name: playerNames[4], isWinner: false },
      team2: { name: playerNames[5], isWinner: false },
      isCompleted: false
    },
    {
      team1: { name: playerNames[6], isWinner: false },
      team2: { name: playerNames[7], isWinner: false },
      isCompleted: false
    }
  ]

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
  
  // Sauvegarder l'état initial
  saveTournamentState()
}

// Lancer le jeu Pong
const launchPongGame = (match: Match) => {
  // Sauvegarder l'état actuel avant de naviguer
  saveTournamentState()
  
  // Naviguer vers le jeu avec les paramètres
  router.push({
    name: 'tournamentgame',
    query: {
      player1: match.team1.name,
      player2: match.team2.name,
      // Ajouter un paramètre pour s'assurer de revenir au bracket
      return: 'bracket'
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
  
  // Sauvegarder l'état après modification
  saveTournamentState()
}

// Avancer le gagnant au tour suivant
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

// Navigation
const goBack = () => {
  router.push({ name: 'tournament-setup' })
}

const resetTournament = () => {
  localStorage.removeItem('tournament_state')
  router.push({ name: 'tournament-setup' })
}

// Watcher pour gérer le retour du jeu
watch(() => route.query, () => {
  handleGameResult()
}, { immediate: true })

// Initialisation
onMounted(() => {
  const playersParam = route.query.players as string
  if (!playersParam) {
    router.push({ name: 'tournament-setup' })
    return
  }
  
  const playerNames = playersParam.split(',')
  
  // Initialiser le tournoi (charge l'état sauvegardé ou crée un nouveau)
  initializeTournament(playerNames)
  
  // Gérer le retour du jeu si il y a des paramètres
  handleGameResult()
})
</script>

<style scoped>
/* Tous les styles précédents + nouvelles classes */
.tournament-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 2rem;
  border: 3px solid #d4af37;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.header-content {
  text-align: center;
  flex: 1;
}

.back-button, .reset-button {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.reset-button:hover {
  background: #d4af37;
  color: #1a472a;
  transform: translateY(-2px);
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

.team.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
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

.waiting-message {
  position: absolute;
  bottom: -2.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
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
  transition: all 0.3s ease;
}

.stat.completed {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
}

.stat.available {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid #fbbf24;
}

.stat-label {
  color: #bbf7d0;
}

.stat-value {
  color: #d4af37;
  font-weight: bold;
}

.stat.completed .stat-value {
  color: #22c55e;
}

.stat.available .stat-value {
  color: #fbbf24;
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
}

@media (max-width: 768px) {
  .tournament-container {
    padding: 1rem;
  }
  
  .tournament-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .back-button, .reset-button {
    width: 100%;
    max-width: 200px;
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

  .team-container {
    margin-bottom: 3rem;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }
}
</style>
