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
          <div class="match-wrapper" v-for="(match, index) in leftQuarterFinals" :key="'left-qf-' + index">
            <div class="match">
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
              </div>
              <div class="connector-right"></div>
            </div>
            <!-- Zone d'action avec hauteur fixe -->
            <div class="action-zone">
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

        <!-- Demi-finale gauche -->
        <div class="round round-2">
          <div class="match-wrapper">
            <div class="match">
              <div class="team-container">
                <div 
                  :class="['team', { 
                    'winner': leftSemiFinal.team1.isWinner, 
                    'clickable': canPlaySemiFinal(leftSemiFinal) && leftSemiFinal.team1.name,
                    'disabled': !canPlaySemiFinal(leftSemiFinal),
                    'ready-to-play': isMatchReadyToPlay(leftSemiFinal)
                  }]"
                  @click="leftSemiFinal.team1.name && canPlaySemiFinal(leftSemiFinal) && selectWinner(leftSemiFinal, 1)"
                >
                  {{ leftSemiFinal.team1.name || 'En attente' }}
                </div>
                <div 
                  :class="['team', { 
                    'winner': leftSemiFinal.team2.isWinner, 
                    'clickable': canPlaySemiFinal(leftSemiFinal) && leftSemiFinal.team2.name,
                    'disabled': !canPlaySemiFinal(leftSemiFinal),
                    'ready-to-play': isMatchReadyToPlay(leftSemiFinal)
                  }]"
                  @click="leftSemiFinal.team2.name && canPlaySemiFinal(leftSemiFinal) && selectWinner(leftSemiFinal, 2)"
                >
                  {{ leftSemiFinal.team2.name || 'En attente' }}
                </div>
              </div>
              <div class="connector-right"></div>
            </div>
            <!-- Zone d'action avec hauteur fixe -->
            <div class="action-zone">
              <button 
                v-if="isMatchReadyToPlay(leftSemiFinal)" 
                @click="launchPongGame(leftSemiFinal)"
                class="play-pong-btn ready-btn"
              >
                🏓 Jouer Pong
              </button>
              <div v-else-if="!canPlaySemiFinal(leftSemiFinal) && (leftSemiFinal.team1.name || leftSemiFinal.team2.name)" class="waiting-message">
                Terminez tous les quarts de finale
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Centre - Finale -->
      <div class="bracket-center">
        <div class="final-section">
          <h2 class="final-title">JOUEUR<br>GAGNANT</h2>
          
          <div class="final-match-wrapper">
            <div class="final-match">
              <div class="team-container final-teams">
                <div 
                  :class="['team final-team', { 
                    'winner': finalMatch.team1.isWinner, 
                    'clickable': canPlayFinal() && finalMatch.team1.name,
                    'disabled': !canPlayFinal(),
                    'ready-to-play': isMatchReadyToPlay(finalMatch)
                  }]"
                  @click="finalMatch.team1.name && canPlayFinal() && selectWinner(finalMatch, 1)"
                >
                  {{ finalMatch.team1.name || 'En attente' }}
                </div>
                <div 
                  :class="['team final-team', { 
                    'winner': finalMatch.team2.isWinner, 
                    'clickable': canPlayFinal() && finalMatch.team2.name,
                    'disabled': !canPlayFinal(),
                    'ready-to-play': isMatchReadyToPlay(finalMatch)
                  }]"
                  @click="finalMatch.team2.name && canPlayFinal() && selectWinner(finalMatch, 2)"
                >
                  {{ finalMatch.team2.name || 'En attente' }}
                </div>
              </div>
            </div>
            <!-- Zone d'action finale avec hauteur fixe -->
            <div class="action-zone final-action-zone">
              <button 
                v-if="isMatchReadyToPlay(finalMatch)" 
                @click="launchPongGame(finalMatch)"
                class="play-pong-btn final-pong-btn ready-btn"
              >
                🏓 FINALE PONG
              </button>
              <div v-else-if="!canPlayFinal() && (finalMatch.team1.name || finalMatch.team2.name)" class="waiting-message">
                Terminez toutes les demi-finales
              </div>
            </div>
          </div>

          <!-- Champion avec hauteur fixe -->
          <div class="champion-section">
            <div v-if="champion" class="champion-content">
              <div class="trophy">🏆</div>
              <div class="champion-name">{{ champion }}</div>
              <div class="champion-subtitle">Champion du Tournoi !</div>
              <button @click="celebrateAndReset" class="celebrate-button">
                🎉 Nouveau Tournoi
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Côté droit -->
      <div class="bracket-side right-side">
        <!-- Demi-finale droite -->
        <div class="round round-2">
          <div class="match-wrapper">
            <div class="match">
              <div class="connector-left"></div>
              <div class="team-container">
                <div 
                  :class="['team', { 
                    'winner': rightSemiFinal.team1.isWinner, 
                    'clickable': canPlaySemiFinal(rightSemiFinal) && rightSemiFinal.team1.name,
                    'disabled': !canPlaySemiFinal(rightSemiFinal),
                    'ready-to-play': isMatchReadyToPlay(rightSemiFinal)
                  }]"
                  @click="rightSemiFinal.team1.name && canPlaySemiFinal(rightSemiFinal) && selectWinner(rightSemiFinal, 1)"
                >
                  {{ rightSemiFinal.team1.name || 'En attente' }}
                </div>
                <div 
                  :class="['team', { 
                    'winner': rightSemiFinal.team2.isWinner, 
                    'clickable': canPlaySemiFinal(rightSemiFinal) && rightSemiFinal.team2.name,
                    'disabled': !canPlaySemiFinal(rightSemiFinal),
                    'ready-to-play': isMatchReadyToPlay(rightSemiFinal)
                  }]"
                  @click="rightSemiFinal.team2.name && canPlaySemiFinal(rightSemiFinal) && selectWinner(rightSemiFinal, 2)"
                >
                  {{ rightSemiFinal.team2.name || 'En attente' }}
                </div>
              </div>
            </div>
            <!-- Zone d'action avec hauteur fixe -->
            <div class="action-zone">
              <button 
                v-if="isMatchReadyToPlay(rightSemiFinal)" 
                @click="launchPongGame(rightSemiFinal)"
                class="play-pong-btn ready-btn"
              >
                🏓 Jouer Pong
              </button>
              <div v-else-if="!canPlaySemiFinal(rightSemiFinal) && (rightSemiFinal.team1.name || rightSemiFinal.team2.name)" class="waiting-message">
                Terminez tous les quarts de finale
              </div>
            </div>
          </div>
        </div>

        <!-- Quarts de finale droite -->
        <div class="round round-1">
          <div class="match-wrapper" v-for="(match, index) in rightQuarterFinals" :key="'right-qf-' + index">
            <div class="match">
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
              </div>
            </div>
            <!-- Zone d'action avec hauteur fixe -->
            <div class="action-zone">
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
      <p>⚠️ <strong>Important :</strong> Les vainqueurs avancent automatiquement au tour suivant</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  autoAdvance?: boolean // Indique si le match doit avancer automatiquement
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

// Navigation et réinitialisation
const goBack = () => {
  // Nettoyer l'état du tournoi
  localStorage.removeItem('tournament_state')
  
  // Rediriger vers la page de configuration
  router.push({ 
    name: 'tournament-setup',
    query: {} // Nettoyer les paramètres
  })
}

const resetTournament = () => {
  // Nettoyer complètement l'état
  localStorage.removeItem('tournament_state')
  
  // Réinitialiser avec de nouveaux joueurs par défaut
  const defaultPlayers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
  initializeTournament(defaultPlayers)
}

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
  return completedQuarterFinals.value === 4 && 
         semiFinal.team1.name && 
         semiFinal.team2.name && 
         !semiFinal.isCompleted
}

const canPlayFinal = () => {
  return completedSemiFinals.value === 2 && 
         finalMatch.value.team1.name && 
         finalMatch.value.team2.name && 
         !finalMatch.value.isCompleted
}

// Vérifier si un match est prêt à être joué
const isMatchReadyToPlay = (match: Match) => {
  if (match.isCompleted) return false
  
  // Pour les demi-finales
  if (match === leftSemiFinal.value || match === rightSemiFinal.value) {
    return completedQuarterFinals.value === 4 && match.team1.name && match.team2.name
  }
  
  // Pour la finale
  if (match === finalMatch.value) {
    return completedSemiFinals.value === 2 && match.team1.name && match.team2.name
  }
  
  return false
}

// Gestion du retour du jeu Pong
const handleGameResult = () => {
  const winner = route.query.winner as string
  const player1 = route.query.player1 as string
  const player2 = route.query.player2 as string
  
  if (winner && player1 && player2) {
    // Trouver et mettre à jour le match correspondant
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
      if (winner === match.team1.name) {
        selectWinner(match, 1)
      } else if (winner === match.team2.name) {
        selectWinner(match, 2)
      }
    }
    
    // Nettoyer l'URL sans changer de page
    const newQuery = { ...route.query }
    delete newQuery.winner
    delete newQuery.player1
    delete newQuery.player2
    
    router.replace({ 
      name: route.name,
      query: newQuery
    })
  }
}

// Initialiser le tournoi avec les joueurs
const initializeTournament = (playerNames: string[]) => {
  // Utiliser des joueurs par défaut si pas assez de joueurs
  if (playerNames.length < 8) {
    playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
  }

  if (loadTournamentState()) {
    return
  }
  
  leftQuarterFinals.value = [
    {
      team1: { name: playerNames[0], isWinner: false },
      team2: { name: playerNames[1], isWinner: false },
      isCompleted: false,
      autoAdvance: true
    },
    {
      team1: { name: playerNames[2], isWinner: false },
      team2: { name: playerNames[3], isWinner: false },
      isCompleted: false,
      autoAdvance: true
    }
  ]

  rightQuarterFinals.value = [
    {
      team1: { name: playerNames[4], isWinner: false },
      team2: { name: playerNames[5], isWinner: false },
      isCompleted: false,
      autoAdvance: true
    },
    {
      team1: { name: playerNames[6], isWinner: false },
      team2: { name: playerNames[7], isWinner: false },
      isCompleted: false,
      autoAdvance: true
    }
  ]

  leftSemiFinal.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false,
    autoAdvance: true
  }

  rightSemiFinal.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false,
    autoAdvance: true
  }

  finalMatch.value = {
    team1: { name: '', isWinner: false },
    team2: { name: '', isWinner: false },
    isCompleted: false
  }
  
  saveTournamentState()
}

// Lancer le jeu Pong
const launchPongGame = (match: Match) => {
  saveTournamentState()
  
  router.push({
    name: 'tournamentgame',
    query: {
      player1: match.team1.name,
      player2: match.team2.name,
      returnTo: 'tournament-bracket'
    }
  })
}

// Sélectionner un gagnant
const selectWinner = (match: Match, teamNumber: 1 | 2) => {
  if (match.isCompleted) return

  match.team1.isWinner = false
  match.team2.isWinner = false

  if (teamNumber === 1) {
    match.team1.isWinner = true
    match.winner = match.team1
  } else {
    match.team2.isWinner = true
    match.winner = match.team2
  }

  match.isCompleted = true
  
  // Avancer automatiquement le vainqueur au tour suivant
  if (match.autoAdvance) {
    advanceWinner(match)
  }
  
  saveTournamentState()
  
  // Vérifier si c'est la fin du tournoi
  if (finalMatch.value.isCompleted) {
    checkAutoReset()
  }
  
  // Vérifier si on peut jouer automatiquement le prochain match
  checkNextMatches()
}

// Avancer le gagnant au tour suivant
const advanceWinner = (match: Match) => {
  if (!match.winner) return

  const leftQFIndex = leftQuarterFinals.value.indexOf(match)
  const rightQFIndex = rightQuarterFinals.value.indexOf(match)

  if (leftQFIndex !== -1) {
    // Quart de finale gauche
    if (leftQFIndex === 0) {
      leftSemiFinal.value.team1.name = match.winner.name
      leftSemiFinal.value.team1.isWinner = false
    } else {
      leftSemiFinal.value.team2.name = match.winner.name
      leftSemiFinal.value.team2.isWinner = false
    }
  } else if (rightQFIndex !== -1) {
    // Quart de finale droite
    if (rightQFIndex === 0) {
      rightSemiFinal.value.team1.name = match.winner.name
      rightSemiFinal.value.team1.isWinner = false
    } else {
      rightSemiFinal.value.team2.name = match.winner.name
      rightSemiFinal.value.team2.isWinner = false
    }
  } else if (match === leftSemiFinal.value) {
    // Demi-finale gauche vers finale
    finalMatch.value.team1.name = match.winner.name
    finalMatch.value.team1.isWinner = false
  } else if (match === rightSemiFinal.value) {
    // Demi-finale droite vers finale
    finalMatch.value.team2.name = match.winner.name
    finalMatch.value.team2.isWinner = false
  }
  
  // Sauvegarder l'état après l'avancement
  saveTournamentState()
}

// Vérifier si les prochains matchs peuvent être joués
const checkNextMatches = () => {
  // Vérifier les demi-finales
  if (completedQuarterFinals.value === 4) {
    // Mettre en évidence les demi-finales prêtes à être jouées
    if (leftSemiFinal.value.team1.name && leftSemiFinal.value.team2.name && !leftSemiFinal.value.isCompleted) {
      // La demi-finale gauche est prête
      console.log("Demi-finale gauche prête à être jouée")
    }
    
    if (rightSemiFinal.value.team1.name && rightSemiFinal.value.team2.name && !rightSemiFinal.value.isCompleted) {
      // La demi-finale droite est prête
      console.log("Demi-finale droite prête à être jouée")
    }
  }
  
  // Vérifier la finale
  if (completedSemiFinals.value === 2) {
    if (finalMatch.value.team1.name && finalMatch.value.team2.name && !finalMatch.value.isCompleted) {
      // La finale est prête
      console.log("Finale prête à être jouée")
    }
  }
}

// Célébrer et réinitialiser après la finale
const celebrateAndReset = () => {
  // Animation de célébration
  setTimeout(() => {
    localStorage.removeItem('tournament_state')
    
    // Choix : soit réinitialiser sur place, soit retourner à la config
    // Option 1: Réinitialiser sur place
    const defaultPlayers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
    initializeTournament(defaultPlayers)
  }, 1000)
}

// Réinitialiser automatiquement si on quitte la page
const handleBeforeUnload = () => {
  // Vérifier si on ne va pas vers le jeu
  const isLeavingForGame = route.query.player1 && route.query.player2
  
  if (!isLeavingForGame) {
    localStorage.removeItem('tournament_state')
  }
}

// Réinitialiser automatiquement après la finale
const checkAutoReset = () => {
  if (finalMatch.value.isCompleted && champion.value) {
    // Attendre 5 secondes puis réinitialiser automatiquement
    setTimeout(() => {
      if (finalMatch.value.isCompleted) { // Double vérification
        localStorage.removeItem('tournament_state')
        initializeTournament(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'])
      }
    }, 5000)
  }
}

// Initialisation
const playersParam = route.query.players as string
let playerNames: string[] = []

if (!playersParam) {
  // Utiliser des joueurs par défaut
  playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
} else {
  playerNames = playersParam.split(',').filter(name => name.trim() !== '')
  // S'assurer qu'on a 8 joueurs
  while (playerNames.length < 8) {
    playerNames.push(`Joueur ${playerNames.length + 1}`)
  }
}

onMounted(() => {
  initializeTournament(playerNames)
  handleGameResult()
  
  // Écouter les changements de route
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Vérifier si des matchs sont prêts à être joués
  checkNextMatches()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Watcher pour gérer le retour du jeu
watch(() => route.query, () => {
  handleGameResult()
}, { immediate: true })
</script>

<style scoped>
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
  max-width: 1300px;
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
}

.round-1 {
  min-height: 500px;
  gap: 2rem;
}

.round-2 {
  min-height: 500px;
  justify-content: center;
}

/* Wrapper de match avec hauteur fixe */
.match-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 120px; /* Hauteur fixe pour chaque match */
  position: relative;
}

.final-match-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 140px; /* Hauteur fixe pour la finale */
  position: relative;
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

.team.ready-to-play {
  border-color: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  animation: readyPulse 2s infinite;
}

@keyframes readyPulse {
  0% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
  }
  100% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  }
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

/* Zone d'action avec hauteur fixe */
.action-zone {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 40px; /* Hauteur fixe réservée */
  display: flex;
  align-items: center;
  justify-content: center;
}

.final-action-zone {
  height: 45px; /* Hauteur légèrement plus grande pour la finale */
}

.play-pong-btn {
  background: #22c55e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.play-pong-btn:hover {
  background: #16a34a;
  transform: scale(1.05);
}

.play-pong-btn.ready-btn {
  animation: readyButtonPulse 2s infinite;
}

@keyframes readyButtonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
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
  background: #f59e0b;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Section champion avec hauteur fixe */
.champion-section {
  height: 150px; /* Hauteur fixe réservée */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.champion-content {
  text-align: center;
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

.celebrate-button {
  background: linear-gradient(45deg, #d4af37, #f4d03f);
  color: #1a472a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 2rem;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  animation: pulse 2s infinite;
}

.celebrate-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  }
  50% {
    box-shadow: 0 4px 25px rgba(212, 175, 55, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  }
}

.champion-content {
  text-align: center;
  animation: championAppear 1s ease-out;
}

@keyframes championAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
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
    min-height: 400px;
  }
  
  .match-wrapper {
    height: 100px;
  }
  
  .final-match-wrapper {
    height: 120px;
  }
  
  .team {
    min-width: 100px;
    font-size: 0.9rem;
  }
  
  .final-title {
    font-size: 1.5rem;
  }

  .champion-section {
    height: 120px;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }

  .action-zone {
    height: 35px;
  }

  .final-action-zone {
    height: 40px;
  }
}
</style>
