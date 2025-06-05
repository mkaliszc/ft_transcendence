<template>
  <div class="game-container">
    <!-- ── En-tête IDENTIQUE à Gameia.vue ── -->
    <header class="game-header">
      <div class="header-container">
        <div class="header-brand">
          <div class="billiard-ball ball-8-small"></div>
          <span class="brand-text">Pong Billard</span>
        </div>
        <div class="header-controls">
          <!-- Score pour les deux joueurs locaux -->
          <div class="score-display">
            <span class="score-label">Joueur 1 :</span>
            <span class="score-value">{{ score.player1 }}</span>
            <span class="score-separator">–</span>
            <span class="score-label">Joueur 2 :</span>
            <span class="score-value">{{ score.player2 }}</span>
          </div>
          <!-- Bouton “Retour” -->
          <button @click="goBack" class="btn btn-primary">
            Retour
          </button>
        </div>
      </div>
    </header>

    <!-- ── Canevas PONG (de style Gameia.vue) ── -->
    <div class="pong-table-container">
      <div class="pong-table">
        <canvas
          ref="canvas"
          :width="gameState.canvasWidth"
          :height="gameState.canvasHeight"
        ></canvas>
      </div>
    </div>

    <!-- ── Instructions ── -->
    <div class="instructions">
      <p>Joueur 1 : flèches ↑ ↓</p>
      <p>Joueur 2 : touches W / S</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D;
let animationId: number;

// État du jeu (local, 2 joueurs, deux raquettes verticales)
interface GameState {
  ballX: number;
  ballY: number;
  ballSize: number;
  ballSpeedX: number;
  ballSpeedY: number;
  canvasWidth: number;
  canvasHeight: number;
  paddleWidth: number;
  paddleHeight: number;
  paddle1Y: number; // Joueur 1 (vertical gauche)
  paddle2Y: number; // Joueur 2 (vertical droite)
  score: {
    player1: number;
    player2: number;
  };
}

const gameState = reactive<GameState>({
  // Balle positionnée au centre
  ballX: 400,
  ballY: 250,
  ballSize: 10,
  ballSpeedX: 5,
  ballSpeedY: 3,
  // Dimensions du canvas
  canvasWidth: 800,
  canvasHeight: 500,
  // Raquettes
  paddleWidth: 10,
  paddleHeight: 100,
  paddle1Y: 200,
  paddle2Y: 200,
  // Score
  score: {
    player1: 0,
    player2: 0
  }
});

const score = gameState.score;

// Gestion des touches
const keys = {
  up: false,
  down: false,
  w: false,
  s: false
};

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      keys.up = true;
      e.preventDefault();
      break;
    case 'ArrowDown':
      keys.down = true;
      e.preventDefault();
      break;
    case 'w':
    case 'W':
      keys.w = true;
      e.preventDefault();
      break;
    case 's':
    case 'S':
      keys.s = true;
      e.preventDefault();
      break;
  }
}

function handleKeyUp(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      keys.up = false;
      e.preventDefault();
      break;
    case 'ArrowDown':
      keys.down = false;
      e.preventDefault();
      break;
    case 'w':
    case 'W':
      keys.w = false;
      e.preventDefault();
      break;
    case 's':
    case 'S':
      keys.s = false;
      e.preventDefault();
      break;
  }
}

// Mise à jour des raquettes (deux raquettes verticales)
function updatePaddles() {
  const speed = 7;
  // Joueur 1 (vertical, flèches ↑/↓)
  if (keys.up && gameState.paddle1Y > 10) {
    gameState.paddle1Y -= speed;
  }
  if (
    keys.down &&
    gameState.paddle1Y + gameState.paddleHeight < gameState.canvasHeight - 10
  ) {
    gameState.paddle1Y += speed;
  }

  // Joueur 2 (vertical, touches W/S)
  if (keys.w && gameState.paddle2Y > 10) {
    gameState.paddle2Y -= speed;
  }
  if (
    keys.s &&
    gameState.paddle2Y + gameState.paddleHeight < gameState.canvasHeight - 10
  ) {
    gameState.paddle2Y += speed;
  }
}

// Dessin de la scène (fond vert, bordure marron, ligne centrale dorée, balle ronde, deux raquettes dorées)
function draw() {
  // 1) Fond “billard vert”
  ctx.fillStyle = '#1a472a';
  ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

  // 2) Bordure épaisse marron/or
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 20;
  ctx.strokeRect(
    10,
    10,
    gameState.canvasWidth - 20,
    gameState.canvasHeight - 20
  );

  // 3) Ligne centrale dorée
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(gameState.canvasWidth / 2, 10);
  ctx.lineTo(
    gameState.canvasWidth / 2,
    gameState.canvasHeight - 10
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // 4) Balle blanche (ronde)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(
    gameState.ballX,
    gameState.ballY,
    gameState.ballSize,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 5) Raquette Joueur 1 (vertical gauche)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(
    20, // x fixe à 20px du bord gauche
    gameState.paddle1Y,
    gameState.paddleWidth,
    gameState.paddleHeight
  );

  // 6) Raquette Joueur 2 (vertical droite)
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(
    gameState.canvasWidth - 30, // x fixe à 30px du bord droit (10px de bordure + 10px marge)
    gameState.paddle2Y,
    gameState.paddleWidth,
    gameState.paddleHeight
  );
}

// Mise à jour de la balle, gestion des collisions et du score
function updateBall() {
  gameState.ballX += gameState.ballSpeedX;
  gameState.ballY += gameState.ballSpeedY;

  const W = gameState.canvasWidth;
  const H = gameState.canvasHeight;

  // 1) Rebond haut/bas (créneaux 10px de marge)
  if (gameState.ballY - gameState.ballSize <= 10) {
    gameState.ballSpeedY = Math.abs(gameState.ballSpeedY);
  }
  if (gameState.ballY + gameState.ballSize >= H - 10) {
    gameState.ballSpeedY = -Math.abs(gameState.ballSpeedY);
  }

  // 2) Collision avec raquette Joueur 1 (gauche)
  if (
    gameState.ballX - gameState.ballSize <= 20 + gameState.paddleWidth &&
    gameState.ballX - gameState.ballSize >= 20 &&
    gameState.ballY >= gameState.paddle1Y &&
    gameState.ballY <= gameState.paddle1Y + gameState.paddleHeight
  ) {
    gameState.ballSpeedX = Math.abs(gameState.ballSpeedX);
  }

  // 3) Collision avec raquette Joueur 2 (droite)
  if (
    gameState.ballX + gameState.ballSize >= W - 30 &&
    gameState.ballX + gameState.ballSize <= W - 30 + gameState.paddleWidth &&
    gameState.ballY >= gameState.paddle2Y &&
    gameState.ballY <= gameState.paddle2Y + gameState.paddleHeight
  ) {
    gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX);
  }

  // 4) Gestion des points (si la balle sort à gauche ou à droite)
  if (gameState.ballX - gameState.ballSize <= 10) {
    // Point pour Joueur 2
    score.player2 += 1;
    resetBall();
  }
  if (gameState.ballX + gameState.ballSize >= W - 10) {
    // Point pour Joueur 1
    score.player1 += 1;
    resetBall();
  }
}

// Réinitialiser la balle au centre avec nouvelle direction aléatoire
function resetBall() {
  gameState.ballX = gameState.canvasWidth / 2;
  gameState.ballY = gameState.canvasHeight / 2;
  gameState.ballSpeedX = Math.random() > 0.5 ? 5 : -5;
  gameState.ballSpeedY = Math.random() > 0.5 ? 3 : -3;
}

// Boucle principale du jeu
function gameLoop() {
  updatePaddles();
  updateBall();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// Lifecycle : onMounted + onUnmounted
onMounted(() => {
  const cvs = canvas.value!;
  ctx = cvs.getContext('2d')!;

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  gameLoop();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
  cancelAnimationFrame(animationId);
});

// Bouton “Retour”
function goBack() {
  router.back();
}
</script>

<style scoped>
/* ─────■ CONTENEUR PRINCIPAL ───── */
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1a472a; /* même vert que dans Gameia.vue */
  color: #f8f9fa;
  min-height: 100vh;
}

/* ─────■ EN-TÊTE (identique à Gameia.vue) ───── */
.game-header {
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
}
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.billiard-ball.ball-8-small {
  width: 40px;
  height: 40px;
  background-color: #000;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.billiard-ball.ball-8-small::after {
  content: "8";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 18px;
}
.brand-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #d4af37;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.score-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.score-label {
  font-size: 1rem;
}
.score-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.score-separator {
  font-size: 1.5rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.btn:hover {
  background: #c19b2e;
}

/* ─────■ CANEVAS PONG (identique à Gameia.vue) ───── */
.pong-table-container {
  margin: 1rem 0;
}
.pong-table {
  position: relative;
  width: 800px;
  height: 500px;
}
canvas {
  display: block;
}

/* ─────■ INSTRUCTIONS ───── */
.instructions {
  text-align: center;
  color: #ccc;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

/* ─────■ RESPONSIVE ───── */
@media (max-width: 768px) {
  .pong-table {
    transform: scale(0.7);
  }
  .score-value {
    font-size: 1.2rem;
  }
  .brand-text {
    font-size: 1.25rem;
  }
  .score-display {
    flex-direction: column;
    gap: 0.2rem;
  }
}
</style>
