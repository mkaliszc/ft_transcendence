<template>
	<div class="join-game">
	  <h1>Rejoindre une partie</h1>
	  <!-- Ajoute ici ton formulaire pour entrer un code de partie par ex. -->
	  <p>Formulaire pour rejoindre une partie à venir...</p>
	  <button @click="goBack">Retour</button>
	</div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const goBack = () => {
	router.back();
  };
  </script>
  
  <style scoped>
  .join-game {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
  }
  </style>
  