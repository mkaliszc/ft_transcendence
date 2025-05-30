<template>
	<div class="multiplayer-hub">
	  <h1>Mode Multijoueur</h1>
	  <button @click="createGame">Créer une partie</button>
	  <button @click="joinGame">Rejoindre une partie</button>
	</div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const createGame = () => {
	router.push('/multiplayer/create');
  };
  
  const joinGame = () => {
	router.push('/multiplayer/join');
  };
  </script>
  
  <style scoped>
  .multiplayer-hub {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
  }
  
  button {
	padding: 0.8rem 1.5rem;
	font-size: 1rem;
	border-radius: 8px;
	border: 1px solid #444;
	background: #1a1a1a;
	color: white;
	cursor: pointer;
	transition: background 0.3s;
  }
  
  button:hover {
	background: #333;
  }
  </style>
  