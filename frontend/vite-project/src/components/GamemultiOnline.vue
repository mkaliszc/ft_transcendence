<template>
	<div class="game">
	  <div class="ball" :style="{ top: ball.y + 'px', left: ball.x + 'px' }"></div>
  
	  <div class="paddle" v-for="(y, i) in playersY" :key="i"
		   :style="getPaddleStyle(i, y)"></div>
  
	  <div class="controls">
		<input v-model="roomIdInput" placeholder="ID de room (vide pour créer)" />
		<button @click="connectToRoom">Jouer</button>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  const roomIdInput = ref('')
  const socket = ref<WebSocket | null>(null)
  const ball = ref({ x: 400, y: 300 })
  const playersY = ref([250, 250, 250, 250])
  const playerIndex = ref(-1)
  
  const connectToRoom = () => {
	socket.value = new WebSocket('ws://localhost:3001')
  
	socket.value.onopen = () => {
	  if (roomIdInput.value) {
		socket.value.send(JSON.stringify({ type: 'join', roomId: roomIdInput.value }))
	  } else {
		socket.value.send(JSON.stringify({ type: 'create' }))
	  }
	}
  
	socket.value.onmessage = (event) => {
	  const data = JSON.parse(event.data)
	  if (data.type === 'room_created') {
		roomIdInput.value = data.roomId
	  } else if (data.type === 'joined') {
		playerIndex.value = data.index
	  } else if (data.type === 'update') {
		ball.value = data.ball
		playersY.value = data.players
	  }
	}
  }
  
  const getPaddleStyle = (i: number, y: number) => {
	if (i === 0) return { top: y + 'px', left: '10px', width: '10px', height: '100px' }
	if (i === 1) return { top: y + 'px', right: '10px', width: '10px', height: '100px' }
	if (i === 2) return { left: y + 'px', top: '10px', width: '100px', height: '10px' }
	if (i === 3) return { left: y + 'px', bottom: '10px', width: '100px', height: '10px' }
	return {}
  }
  
  onMounted(() => {
	window.addEventListener('keydown', (e) => {
	  const idx = playerIndex.value
	  if (idx === -1) return
  
	  if (idx < 2) {
		if (e.key === 'ArrowUp') playersY.value[idx] -= 10
		if (e.key === 'ArrowDown') playersY.value[idx] += 10
	  } else {
		if (e.key === 'ArrowLeft') playersY.value[idx] -= 10
		if (e.key === 'ArrowRight') playersY.value[idx] += 10
	  }
  
	  socket.value?.send(JSON.stringify({ type: 'move', y: playersY.value[idx] }))
	})
  })
  </script>
  
  <style scoped>
  .game {
	position: relative;
	width: 800px;
	height: 600px;
	background: black;
	margin: auto;
	border: 2px solid white;
  }
  .ball {
	position: absolute;
	width: 15px;
	height: 15px;
	background: white;
	border-radius: 50%;
  }
  .paddle {
	position: absolute;
	background: white;
  }
  .controls {
	margin-top: 10px;
	text-align: center;
  }
  </style>