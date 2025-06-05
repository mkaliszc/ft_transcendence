<template>
  <div class="online-game-container">
    <!-- En‐tête (score, titre, bouton Retour) -->
    <header class="game-header">
      <div class="header-left">
        <span class="title">{{ $t('pongOnlineTitle') /* “Pong Multijoueur” */ }}</span>
      </div>
      <div class="header-center">
        <!-- Score : joueur1 – joueur2 (– joueurs 3/4 si mode 4) -->
        <template v-if="gameState">
          <span class="score">{{ gameState.score.player1 }}</span>
          <span>–</span>
          <span class="score">{{ gameState.score.player2 }}</span>
          <span v-if="gameState.gameMode === 4">–</span>
          <span v-if="gameState.gameMode === 4" class="score">{{ gameState.score.player3 }}</span>
          <span v-if="gameState.gameMode === 4">–</span>
          <span v-if="gameState.gameMode === 4" class="score">{{ gameState.score.player4 }}</span>
        </template>
      </div>
      <div class="header-right">
        <button @click="goHome" class="btn btn-back">{{ $t('backToHome') /* “Retour Accueil” */ }}</button>
      </div>
    </header>

    <!-- Canvas Pong -->
    <div class="pong-table-container">
      <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
// ---------------------------------------------
//   GamemultiOnline.vue (Touché flèche Haut/Bas pour tous, moins de lag)
// ---------------------------------------------
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { connectSocket, sendMessage, setOnMessage } from '../services/websocket';
import { useI18n } from 'vue-i18n';

// Récupérer query params ?id=<gameId>&playerId=<playerId>
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const gameId = (route.query.id as string) || '';
const playerId = (route.query.playerId as string) || '';
if (!gameId || !playerId) {
  router.replace({ name: 'Home' });
}

// Référence au canvas
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D;

// Dimensions du canvas
const canvasWidth = 800;
const canvasHeight = 500;

// Type GameState
interface GameState {
  ballX: number;
  ballY: number;
  ballSize: number;
  ballSpeedX: number;
  ballSpeedY: number;
  paddles: Record<string, number>; // {player1: Y, player2: Y, player3: X, player4: X}
  score: {
    player1: number;
    player2: number;
    player3: number;
    player4: number;
  };
  gameMode: number;      // 2 ou 4
  host: string;          // "player1"
  gameStarted: boolean;  // false jusqu’à “all-ready”
}

const gameState = reactive<GameState>({
  ballX: canvasWidth / 2,
  ballY: canvasHeight / 2,
  ballSize: 10,
  ballSpeedX: 0,
  ballSpeedY: 0,
  // positions initiales : player1,player2 centrés verticalement ; player3,player4 centrés horizontalement
  paddles: {
    player1: 200,
    player2: 200,
    player3: (canvasWidth - 100) / 2,
    player4: (canvasWidth - 100) / 2
  },
  score: {
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0
  },
  gameMode: 2,
  host: 'player1',
  gameStarted: false
});

// Pour mémoriser la dernière position envoyée au serveur et éviter les envois redondants
const lastSentPaddlePos: Record<string, number> = {
  player1: gameState.paddles.player1,
  player2: gameState.paddles.player2,
  player3: gameState.paddles.player3,
  player4: gameState.paddles.player4
};

// Clavier : touche pressée ou non
const keys: Record<string, boolean> = reactive({
  ArrowUp: false,
  ArrowDown: false,
  z: false,
  s: false,
  q: false,
  d: false,
  ArrowLeft: false,
  ArrowRight: false
});

function onKeyDown(e: KeyboardEvent) {
  const k = e.key;
  if (keys.hasOwnProperty(k)) {
    keys[k] = true;
    e.preventDefault();
  }
}
function onKeyUp(e: KeyboardEvent) {
  const k = e.key;
  if (keys.hasOwnProperty(k)) {
    keys[k] = false;
    e.preventDefault();
  }
}

let isHost = false;
let animationId = 0;

// Mise à jour des positions des paddles (envoi WS seulement quand la position change)
function updatePaddles() {
  const speed = 7;

  // -- JOUEUR 1 (gauche, vertical) : flèches Haut/Bas
  if (playerId === 'player1') {
    const oldY = gameState.paddles.player1;
    if (keys['ArrowUp'] && oldY > 10) {
      gameState.paddles.player1 = oldY - speed;
    }
    if (keys['ArrowDown'] && oldY + 100 < canvasHeight - 10) {
      gameState.paddles.player1 = oldY + speed;
    }
    // N’envoyer QUE si la position a vraiment changé
    if (gameState.paddles.player1 !== lastSentPaddlePos.player1) {
      lastSentPaddlePos.player1 = gameState.paddles.player1;
      sendMessage('player-move', {
        gameId,
        playerId: 'player1',
        moveData: { paddlePosition: gameState.paddles.player1 }
      });
    }
  }

  // -- JOUEUR 2 (droite, vertical) : flèches Haut/Bas
  if (playerId === 'player2') {
    const oldY = gameState.paddles.player2;
    if (keys['ArrowUp'] && oldY > 10) {
      gameState.paddles.player2 = oldY - speed;
    }
    if (keys['ArrowDown'] && oldY + 100 < canvasHeight - 10) {
      gameState.paddles.player2 = oldY + speed;
    }
    if (gameState.paddles.player2 !== lastSentPaddlePos.player2) {
      lastSentPaddlePos.player2 = gameState.paddles.player2;
      sendMessage('player-move', {
        gameId,
        playerId: 'player2',
        moveData: { paddlePosition: gameState.paddles.player2 }
      });
    }
  }

  // -- SI MODE 4 : JOUEUR 3 et 4 utilisent AUSSI flèches Haut/Bas (pour déplacer horizontalement)
  if (gameState.gameMode === 4) {
    // Joueur 3 (haut) : quand on appuie Haut, on décale X vers la gauche ; Bas → X vers la droite
    if (playerId === 'player3') {
      const oldX3 = gameState.paddles.player3;
      if (keys['ArrowUp'] && oldX3 > 10) {
        gameState.paddles.player3 = oldX3 - speed;
      }
      if (keys['ArrowDown'] && oldX3 + 100 < canvasWidth - 10) {
        gameState.paddles.player3 = oldX3 + speed;
      }
      if (gameState.paddles.player3 !== lastSentPaddlePos.player3) {
        lastSentPaddlePos.player3 = gameState.paddles.player3;
        sendMessage('player-move', {
          gameId,
          playerId: 'player3',
          moveData: { paddlePosition: gameState.paddles.player3 }
        });
      }
    }
    // Joueur 4 (bas) : idem, flèches Haut/Bas pour déplacer X
    if (playerId === 'player4') {
      const oldX4 = gameState.paddles.player4;
      if (keys['ArrowUp'] && oldX4 > 10) {
        gameState.paddles.player4 = oldX4 - speed;
      }
      if (keys['ArrowDown'] && oldX4 + 100 < canvasWidth - 10) {
        gameState.paddles.player4 = oldX4 + speed;
      }
      if (gameState.paddles.player4 !== lastSentPaddlePos.player4) {
        lastSentPaddlePos.player4 = gameState.paddles.player4;
        sendMessage('player-move', {
          gameId,
          playerId: 'player4',
          moveData: { paddlePosition: gameState.paddles.player4 }
        });
      }
    }
  }
}

// Mise à jour de la balle (host uniquement)
function updateBall() {
  // Rebond haut/bas
  if (gameState.ballY - gameState.ballSize <= 10) {
    gameState.ballSpeedY = Math.abs(gameState.ballSpeedY);
  }
  if (gameState.ballY + gameState.ballSize >= canvasHeight - 10) {
    gameState.ballSpeedY = -Math.abs(gameState.ballSpeedY);
  }

  // Rebond raquette player1 (gauche)
  if (
    gameState.ballX - gameState.ballSize <= 20 + 10 &&
    gameState.ballX - gameState.ballSize >= 20 &&
    gameState.ballY >= gameState.paddles.player1 &&
    gameState.ballY <= gameState.paddles.player1 + 100
  ) {
    gameState.ballSpeedX = Math.abs(gameState.ballSpeedX);
  }

  // Rebond raquette player2 (droite)
  if (
    gameState.ballX + gameState.ballSize >= canvasWidth - 30 &&
    gameState.ballX + gameState.ballSize <= canvasWidth - 30 + 10 &&
    gameState.ballY >= gameState.paddles.player2 &&
    gameState.ballY <= gameState.paddles.player2 + 100
  ) {
    gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX);
  }

  // Si mode 4, on gère collision avec les raquettes du haut (player3) et du bas (player4)
  if (gameState.gameMode === 4) {
    // Raquette player3 (haut) : Y proche de 10–20, X overlap
    if (
      gameState.ballY - gameState.ballSize <= 20 &&
      gameState.ballY - gameState.ballSize >= 10 &&
      gameState.ballX >= gameState.paddles.player3 &&
      gameState.ballX <= gameState.paddles.player3 + 100
    ) {
      gameState.ballSpeedY = Math.abs(gameState.ballSpeedY);
    }
    // Raquette player4 (bas) : Y proche de canvasHeight-20
    if (
      gameState.ballY + gameState.ballSize >= canvasHeight - 20 &&
      gameState.ballY + gameState.ballSize <= canvasHeight - 10 &&
      gameState.ballX >= gameState.paddles.player4 &&
      gameState.ballX <= gameState.paddles.player4 + 100
    ) {
      gameState.ballSpeedY = -Math.abs(gameState.ballSpeedY);
    }
  }

  // Mise à jour position
  gameState.ballX += gameState.ballSpeedX;
  gameState.ballY += gameState.ballSpeedY;

  // Score à gauche/droite
  if (gameState.ballX - gameState.ballSize <= 10) {
    gameState.score.player2 += 1;
    resetBall();
  }
  if (gameState.ballX + gameState.ballSize >= canvasWidth - 10) {
    gameState.score.player1 += 1;
    resetBall();
  }

  // Si mode 4, score par le haut ou par le bas
  if (gameState.gameMode === 4 && gameState.ballY - gameState.ballSize <= 0) {
    gameState.score.player4 += 1; // point pour celui du bas
    resetBall();
  }
  if (gameState.gameMode === 4 && gameState.ballY + gameState.ballSize >= canvasHeight) {
    gameState.score.player3 += 1; // point pour celui du haut
    resetBall();
  }
}

// Centre la balle et donne une direction aléatoire
function resetBall() {
  gameState.ballX = canvasWidth / 2;
  gameState.ballY = canvasHeight / 2;
  gameState.ballSpeedX = Math.random() > 0.5 ? 5 : -5;
  gameState.ballSpeedY = Math.random() > 0.5 ? 3 : -3;
}

// Dessine le terrain, les paddles et la balle
function draw() {
  const cvs = canvasRef.value!;
  ctx = cvs.getContext('2d')!;

  // Fond vert
  ctx.fillStyle = '#1a472a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Bordure marron/or épaisse
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

  // Ligne centrale dorée (verticale)
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 10);
  ctx.lineTo(canvasWidth / 2, canvasHeight - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Balle blanche
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(gameState.ballX, gameState.ballY, gameState.ballSize, 0, Math.PI * 2);
  ctx.fill();

  // Raquette player1 (verticale gauche)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(20, gameState.paddles.player1, 10, 100);

  // Raquette player2 (verticale droite)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(canvasWidth - 30, gameState.paddles.player2, 10, 100);

  // Si mode 4, dessiner raquette player3 (haut, horizontale) et player4 (bas)
  if (gameState.gameMode === 4) {
    // player3 : en haut (Y fixe = 10), largeur 100 x hauteur 10
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(gameState.paddles.player3, 10, 100, 10);

    // player4 : en bas (Y fixe = canvasHeight - 20)
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(gameState.paddles.player4, canvasHeight - 20, 100, 10);
  }

  // Afficher le score sur le canvas
  ctx.fillStyle = '#d4af37';
  ctx.font = '24px Arial';
  ctx.fillText(`${gameState.score.player1}`, canvasWidth / 4, 40);
  ctx.fillText(`${gameState.score.player2}`, (canvasWidth * 3) / 4, 40);

  if (gameState.gameMode === 4) {
    ctx.fillText(`${gameState.score.player3}`, canvasWidth / 4, 70);
    ctx.fillText(`${gameState.score.player4}`, (canvasWidth * 3) / 4, 70);
  }
}

// Boucle principale du jeu
function gameLoop() {
  if (gameState.gameStarted) {
    if (isHost) {
      updatePaddles();
      updateBall();
      // n’envoyer game-update que si host
      sendMessage('game-update', {
        gameId,
        gameState: JSON.parse(JSON.stringify(gameState))
      });
    } else {
      updatePaddles();
    }
  }
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// Démarrer la boucle
function startGameLoop() {
  animationId = requestAnimationFrame(gameLoop);
}

// Retourner à l’accueil
function goHome() {
  router.replace({ name: 'Home' });
}

onMounted(() => {
  console.log('[GamemultiOnline] onMounted : connexion WS…');
  connectSocket('ws://localhost:3002');

  setOnMessage((data: any) => {
    console.warn('[GamemultiOnline] WS message →', data);
    switch (data.type) {
      case 'all-ready': {
        const { gameState: newState } = data.payload;
        Object.assign(gameState, newState);
        gameState.gameStarted = true;
        if (playerId === gameState.host) {
          isHost = true;
        }
        console.warn('[GamemultiOnline] Received all-ready → démarre le jeu');
        break;
      }
      case 'player-joined': {
        const { players: newPlayers, playersCount: pc, maxPlayers: mp, gameState: stateFromServer } = data.payload;
        // Si la partie a déjà démarré côté serveur, on le récupère directement
        if (stateFromServer.gameStarted) {
          Object.assign(gameState, stateFromServer);
          gameState.gameStarted = true;
          if (playerId === gameState.host) {
            isHost = true;
          }
          console.warn('[GamemultiOnline] Received player-joined (gameStarted=true) → démarre le jeu');
        } else {
          // Sinon, on copie le gameState pour avoir la bonne gameMode (2 ou 4)
          Object.assign(gameState, stateFromServer);
          // Si maxPlayers est 4, on force le mode 4
          if (mp === 4) {
            gameState.gameMode = 4;
          }
        }
        break;
      }
      case 'opponent-move': {
        const { playerId: pid, moveData } = data.payload;
        gameState.paddles[pid] = moveData.paddlePosition;
        break;
      }
      case 'game-update': {
        const { gameState: updatedState } = data.payload;
        Object.assign(gameState, updatedState);
        break;
      }
      default:
        console.warn('[GamemultiOnline] message WS non géré :', data.type);
        break;
    }
  });

  // Demande immédiate de l’état global de la partie (pour attraper gameStarted=true si la partie a déjà lancé)
  sendMessage('get-players', { gameId });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  startGameLoop();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  // Vous pouvez aussi fermer la socket ici si vous avez un closeSocket()
});
</script>

<style scoped>
.online-game-container {
  min-height: 100vh;
  background: #1a472a;
  color: #f8f9fa;
  display: flex;
  flex-direction: column;
}
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
}
.header-left .title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d4af37;
}
.header-center {
  font-size: 1.25rem;
  color: #d4af37;
}
.header-right .btn-back {
  padding: 0.5rem 1rem;
  background: #f44336;
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  font-weight: bold;
}
.header-right .btn-back:hover {
  background: #da190b;
}
.pong-table-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
canvas {
  border: 4px solid #d4af37;
  background: #1a472a;
}
</style>
