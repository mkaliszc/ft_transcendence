<template>
	<div class="game-container">
	  <header class="game-header">
		<div class="header-container">
		  <div class="header-brand">
			<div class="billiard-ball ball-8-small"></div>
			<span class="brand-text">Pong Billard - Multijoueur</span>
		  </div>
		  <div class="header-controls">
			<button @click="goHome" class="btn btn-secondary">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"></path>
			  </svg>
			  Accueil
			</button>
			<button @click="resetGame" class="btn btn-primary">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
			  </svg>
			  Nouvelle Partie
			</button>
			<button @click="togglePause" class="btn btn-secondary">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path v-if="!isPaused" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
				<path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
			  </svg>
			  {{ isPaused ? 'Reprendre' : 'Pause' }}
			</button>
		  </div>
		</div>
	  </header>
  
	  <main class="game-main">
		<div class="game-area" ref="gameContainer">
		  <!-- Game table with home page styling -->
		  <div class="pong-table-container">
			<div class="pong-table">
			  <canvas 
				ref="gameCanvas" 
				width="800" 
				height="400" 
				class="game-canvas"
			  ></canvas>
			</div>
		  </div>
  
		  <!-- Pause overlay -->
		  <div v-if="isPaused" class="game-overlay">
			<h2 class="overlay-title">Jeu en Pause</h2>
			<button @click="togglePause" class="btn btn-primary btn-large">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
			  </svg>
			  Reprendre
			</button>
		  </div>
  
		  <!-- Game over overlay -->
		  <div v-if="gameOver" class="game-overlay">
			<h2 class="overlay-title">Partie Terminée</h2>
			<p class="overlay-subtitle">
			  {{ getWinnerText() }}
			</p>
			<div class="final-score">
			  {{ player1Score }} - {{ player2Score }}
			</div>
			<button @click="resetGame" class="btn btn-primary btn-large">
			  <svg class="btn-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
			  </svg>
			  Nouvelle Partie
			</button>
		  </div>
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
  
	  <footer class="game-footer">
		<div class="footer-container">
		  <div class="controls-info">
			<div class="player-controls">
			  <strong>Joueur 1 (Gauche):</strong> Touches W/S
			</div>
			<div class="player-controls">
			  <strong>Joueur 2 (Droite):</strong> Flèches ↑/↓
			</div>
		  </div>
		  <p class="copyright">Amusez-vous bien !</p>
		</div>
	  </footer>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '@/composable/useAuths';
  
  // Router et auth
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Game state
  const gameCanvas = ref(null);
  const gameContainer = ref(null);
  const ctx = ref(null);
  const isPaused = ref(false);
  const gameOver = ref(false);
  const player1Score = ref(0);
  const player2Score = ref(0);
  const winningScore = 5;
  
  // Keyboard state for smooth movement
  const keys = ref({
	// Joueur 1 (gauche) - W/S
	KeyW: false,
	KeyS: false,
	// Joueur 2 (droite) - Flèches haut/bas
	ArrowUp: false,
	ArrowDown: false
  });
  
  // Game elements
  const ball = ref({
	x: 400,
	y: 200,
	radius: 12,
	speedX: 5,
	speedY: 3,
	color: '#ffffff'
  });
  
  const player1 = ref({
	x: 30,
	y: 200,
	width: 8,
	height: 60,
	color: '#d4af37',
	speed: 8
  });
  
  const player2 = ref({
	x: 762,
	y: 200,
	width: 8,
	height: 60,
	color: '#d4af37',
	speed: 8
  });
  
  // Animation frame ID for cleanup
  let animationFrameId = null;
  
  // Initialize game
  onMounted(() => {
	ctx.value = gameCanvas.value.getContext('2d');
	resetBall();
	window.addEventListener('keydown', handleKeyDown);
	window.addEventListener('keyup', handleKeyUp);
	window.addEventListener('resize', handleResize);
	handleResize();
	startGameLoop();
  });
  
  onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown);
	window.removeEventListener('keyup', handleKeyUp);
	window.removeEventListener('resize', handleResize);
	if (animationFrameId) {
	  cancelAnimationFrame(animationFrameId);
	}
  });
  
  watch([player1Score, player2Score], ([newPlayer1Score, newPlayer2Score]) => {
	if (newPlayer1Score >= winningScore || newPlayer2Score >= winningScore) {
	  gameOver.value = true;
	  isPaused.value = true;
	}
  });
  
  function startGameLoop() {
	if (!isPaused.value && !gameOver.value) {
	  updateGame();
	  drawGame();
	}
	animationFrameId = requestAnimationFrame(startGameLoop);
  }
  
  function updateGame() {
	handleKeyboardMovement();
	
	ball.value.x += ball.value.speedX;
	ball.value.y += ball.value.speedY;
  
	// Ball collision with top and bottom walls
	if (ball.value.y - ball.value.radius <= 0 || ball.value.y + ball.value.radius >= gameCanvas.value.height) {
	  ball.value.speedY = -ball.value.speedY;
	  if (ball.value.y - ball.value.radius <= 0) {
		ball.value.y = ball.value.radius;
	  } else {
		ball.value.y = gameCanvas.value.height - ball.value.radius;
	  }
	}
  
	// Paddle collision detection
	const player1Collision = checkImprovedPaddleCollision(player1.value);
	const player2Collision = checkImprovedPaddleCollision(player2.value);
  
	if (player1Collision || player2Collision) {
	  const paddle = player1Collision ? player1.value : player2.value;
	  // Clamp hitPos pour éviter les rebonds extrêmes sur les coins
	  let hitPos = (ball.value.y - paddle.y) / (paddle.height / 2);
	  hitPos = Math.max(-1, Math.min(1, hitPos));

	  ball.value.speedX = -ball.value.speedX;
	  ball.value.speedY = hitPos * 4;
	  // Limiter la vitesse verticale pour éviter les trajectoires trop verticales
	  const maxVerticalSpeed = 6;
	  if (ball.value.speedY > maxVerticalSpeed) ball.value.speedY = maxVerticalSpeed;
	  if (ball.value.speedY < -maxVerticalSpeed) ball.value.speedY = -maxVerticalSpeed;

	  const minSpeed = 4;
	  if (Math.abs(ball.value.speedX) < minSpeed) {
		ball.value.speedX = ball.value.speedX > 0 ? minSpeed : -minSpeed;
	  }
	  
	  const maxSpeed = 10;
	  if (Math.abs(ball.value.speedX) < maxSpeed) {
		ball.value.speedX *= 1.05;
	  }
	  
	  // Correction du placement pour éviter de rester "collé" à la palette
	  if (player1Collision) {
		ball.value.x = paddle.x + paddle.width + ball.value.radius + 1;
	  } else {
		ball.value.x = paddle.x - ball.value.radius - 1;
	  }
	  
	}
  
	// Ball out of bounds (scoring)
	if (ball.value.x - ball.value.radius < 0) {
	  player2Score.value++;
	  resetBall();
	} else if (ball.value.x + ball.value.radius > gameCanvas.value.width) {
	  player1Score.value++;
	  resetBall();
	}
  }
  
  function checkImprovedPaddleCollision(paddle) {
	// Ajout d'une tolérance pour éviter les ratés sur les bords
	const tolerance = 4;
	const ballLeft = ball.value.x - ball.value.radius;
	const ballRight = ball.value.x + ball.value.radius;
	const ballTop = ball.value.y - ball.value.radius;
	const ballBottom = ball.value.y + ball.value.radius;

	const paddleLeft = paddle.x - tolerance;
	const paddleRight = paddle.x + paddle.width + tolerance;
	const paddleTop = paddle.y - paddle.height / 2 - tolerance;
	const paddleBottom = paddle.y + paddle.height / 2 + tolerance;

	const overlapping = ballRight > paddleLeft && 
					   ballLeft < paddleRight && 
					   ballBottom > paddleTop && 
					   ballTop < paddleBottom;
	
	if (!overlapping) return false;

	// Ne rebondit que si la balle va vers la palette
	if (paddle === player1.value && ball.value.speedX > 0) return false;
	if (paddle === player2.value && ball.value.speedX < 0) return false;

	return true;
  }
  
  function drawGame() {
	// Clear canvas
	ctx.value.clearRect(0, 0, gameCanvas.value.width, gameCanvas.value.height);
	
	// Draw table background (same as home page)
	const gradient = ctx.value.createLinearGradient(0, 0, gameCanvas.value.width, gameCanvas.value.height);
	gradient.addColorStop(0, '#1a472a');
	gradient.addColorStop(0.5, '#2d5a3d');
	gradient.addColorStop(1, '#1a472a');
	ctx.value.fillStyle = gradient;
	ctx.value.fillRect(0, 0, gameCanvas.value.width, gameCanvas.value.height);
	
	// Draw border
	ctx.value.strokeStyle = '#d4af37';
	ctx.value.lineWidth = 4;
	ctx.value.strokeRect(2, 2, gameCanvas.value.width - 4, gameCanvas.value.height - 4);
	
	// Draw center line
	ctx.value.beginPath();
	ctx.value.setLineDash([]);
	ctx.value.moveTo(gameCanvas.value.width / 2, 0);
	ctx.value.lineTo(gameCanvas.value.width / 2, gameCanvas.value.height);
	ctx.value.strokeStyle = '#d4af37';
	ctx.value.lineWidth = 2;
	ctx.value.stroke();
  
	// Draw ball with glow effect
	ctx.value.beginPath();
	ctx.value.arc(ball.value.x, ball.value.y, ball.value.radius + 2, 0, Math.PI * 2);
	ctx.value.fillStyle = 'rgba(255, 255, 255, 0.3)';
	ctx.value.fill();
	
	ctx.value.beginPath();
	ctx.value.arc(ball.value.x, ball.value.y, ball.value.radius, 0, Math.PI * 2);
	ctx.value.fillStyle = ball.value.color;
	ctx.value.fill();
	ctx.value.shadowColor = 'rgba(255, 255, 255, 0.5)';
	ctx.value.shadowBlur = 10;
	ctx.value.fill();
	ctx.value.shadowBlur = 0;
  
	// Draw paddles with golden color
	ctx.value.fillStyle = player1.value.color;
	ctx.value.fillRect(
	  player1.value.x, 
	  player1.value.y - player1.value.height / 2, 
	  player1.value.width, 
	  player1.value.height
	);
	
	ctx.value.fillStyle = player2.value.color;
	ctx.value.fillRect(
	  player2.value.x, 
	  player2.value.y - player2.value.height / 2, 
	  player2.value.width, 
	  player2.value.height
	);
  
	// Draw score with player labels
	ctx.value.font = 'bold 24px Arial';
	ctx.value.fillStyle = '#d4af37';
	ctx.value.textAlign = 'center';
	ctx.value.fillText(player1Score.value.toString(), gameCanvas.value.width * 0.25, 30);
	ctx.value.fillText(player2Score.value.toString(), gameCanvas.value.width * 0.75, 30);
	
	// Draw player labels
	ctx.value.font = 'bold 16px Arial';
	ctx.value.fillStyle = '#e0e0e0';
	ctx.value.fillText('Joueur 1', gameCanvas.value.width * 0.25, 55);
	ctx.value.fillText('Joueur 2', gameCanvas.value.width * 0.75, 55);
  }
  
  function resetBall() {
	ball.value.x = gameCanvas.value.width / 2;
	ball.value.y = gameCanvas.value.height / 2;
	ball.value.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
	ball.value.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }
  
  function resetGame() {
	player1Score.value = 0;
	player2Score.value = 0;
	gameOver.value = false;
	isPaused.value = false;
	resetBall();
  }
  
  function togglePause() {
	isPaused.value = !isPaused.value;
  }
  
  function getWinnerText() {
	if (player1Score.value > player2Score.value) {
	  return 'Joueur 1 a gagné !';
	} else {
	  return 'Joueur 2 a gagné !';
	}
  }
  
  function handleKeyboardMovement() {
	if (isPaused.value || gameOver.value) return;
	
	// Joueur 1 (gauche) - W/S ou flèches
	const player1Up = keys.value.KeyW;
	const player1Down = keys.value.KeyS;
	
	if (player1Up && !player1Down) {
	  player1.value.y -= player1.value.speed;
	} else if (player1Down && !player1Up) {
	  player1.value.y += player1.value.speed;
	}
	
	// Joueur 2 (droite) - Flèches haut/bas
	const player2Up = keys.value.ArrowUp;
	const player2Down = keys.value.ArrowDown;
	
	if (player2Up && !player2Down) {
	  player2.value.y -= player2.value.speed;
	} else if (player2Down && !player2Up) {
	  player2.value.y += player2.value.speed;
	}
	
	// Contraintes pour joueur 1
	if (player1.value.y - player1.value.height / 2 < 0) {
	  player1.value.y = player1.value.height / 2;
	} else if (player1.value.y + player1.value.height / 2 > gameCanvas.value.height) {
	  player1.value.y = gameCanvas.value.height - player1.value.height / 2;
	}
	
	// Contraintes pour joueur 2
	if (player2.value.y - player2.value.height / 2 < 0) {
	  player2.value.y = player2.value.height / 2;
	} else if (player2.value.y + player2.value.height / 2 > gameCanvas.value.height) {
	  player2.value.y = gameCanvas.value.height - player2.value.height / 2;
	}
  }
  
  function handleKeyDown(e) {
	if (e.code in keys.value) {
	  keys.value[e.code] = true;
	  e.preventDefault();
	}
	
	if (e.key === 'p' || e.key === 'Escape') {
	  togglePause();
	} else if (e.key === 'r' || e.key === 'R') {
	  if (gameOver.value) {
		resetGame();
	  }
	}
  }
  
  function handleKeyUp(e) {
	if (e.code in keys.value) {
	  keys.value[e.code] = false;
	  e.preventDefault();
	}
  }
  
  function handleResize() {
	if (gameContainer.value && gameCanvas.value) {
	  const containerWidth = gameContainer.value.clientWidth;
	  const scale = Math.min(1, containerWidth / 800);
	  
	  gameCanvas.value.style.transform = `scale(${scale})`;
	  gameCanvas.value.style.transformOrigin = 'top left';
	}
  }
  
  // Fonction pour retourner à l'accueil
  function goHome() {
    if (isAuthenticated.value) {
      router.push('/Home2');
    } else {
      router.push('/');
    }
  }
</script>
  
  <style scoped>
  /* Suppression du responsive : largeur/hauteur fixes pour la zone de jeu */
.game-container {
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
}

.pong-table-container, .pong-table {
  width: 800px;
  min-width: 800px;
  max-width: 800px;
  height: 400px;
  min-height: 400px;
  max-height: 400px;
  margin: 0 auto;
}

.game-canvas {
  width: 800px !important;
  height: 400px !important;
  min-width: 800px;
  min-height: 400px;
  max-width: 800px;
  max-height: 400px;
}

  .game-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%);
	color: #f8f9fa;
	position: relative;
	display: flex;
	flex-direction: column;
  }
  
  .game-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background: rgba(0, 0, 0, 0.3);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  }
  
  .header-container {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
  }
  
  .header-brand {
	display: flex;
	align-items: center;
	gap: 1rem;
  }
  
  .brand-text {
	font-size: 1.5rem;
	font-weight: bold;
	color: #d4af37;
	margin: 0;
  }
  
  .header-controls {
	display: flex;
	align-items: center;
	gap: 1.5rem;
  }
  
  .btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 0.5rem;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	text-transform: uppercase;
	letter-spacing: 0.5px;
  }
  
  .btn-icon {
	width: 16px;
	height: 16px;
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
  
  .btn-large {
	padding: 1rem 2rem;
	font-size: 1.1rem;
  }
  
  .game-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	position: relative;
  }
  
  .game-area {
	position: relative;
	z-index: 2;
  }
  
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
  
  .game-canvas {
	border-radius: 0.5rem;
	box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
  }
  
  .game-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(10px);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-radius: 1rem;
	z-index: 10;
  }
  
  .overlay-title {
	font-size: 2.5rem;
	font-weight: bold;
	color: #d4af37;
	margin-bottom: 1rem;
	text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  .overlay-subtitle {
	font-size: 1.25rem;
	color: #e0e0e0;
	margin-bottom: 1rem;
	text-align: center;
  }
  
  .final-score {
	font-size: 2rem;
	font-weight: bold;
	color: #d4af37;
	margin-bottom: 2rem;
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
  
  .game-footer {
	text-align: center;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.3);
	color: #e0e0e0;
	border-top: 1px solid rgba(212, 175, 55, 0.3);
  }
  
  .footer-container {
	font-size: 0.9rem;
  }
  
  .controls-info {
	display: flex;
	justify-content: center;
	gap: 2rem;
	margin-bottom: 0.5rem;
	flex-wrap: wrap;
  }
  
  .player-controls {
	padding: 0.5rem 1rem;
	background: rgba(212, 175, 55, 0.1);
	border-radius: 0.5rem;
	border: 1px solid rgba(212, 175, 55, 0.3);
  }
  
  .copyright {
	margin-top: 0.5rem;
	font-size: 0.8rem;
  }
  
  @keyframes float {
	0%, 100% { transform: translateY(0px) rotate(0deg); }
	50% { transform: translateY(-20px) rotate(180deg); }
  }
  

  </style>