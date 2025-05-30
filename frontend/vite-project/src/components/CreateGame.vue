<template>
	<div class="create-game">
	  <h1>Créer une partie</h1>
	  <!-- Ajoute ici ton formulaire de création ou ta logique -->
	  <p>Formulaire de création d'une partie à venir...</p>
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
  .create-game {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin-top: 2rem;
  }
  </style>
  