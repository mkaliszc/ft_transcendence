<template>
  <div class="waiting-room">
    <h1>Salle d'attente</h1>
    <p>En cours de développement...</p>
    <button @click="goBack">Retour</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.push({ name: 'CreateOrJoin' });
}
</script>

<style scoped>
.waiting-room {
  padding: 2rem;
  text-align: center;
  color: white;
}
</style>
