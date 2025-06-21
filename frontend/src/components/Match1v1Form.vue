<template>
  <div class="match-1v1-form">
    <h2>🏓 Sauvegarder Match 1v1</h2>
    
    <form @submit.prevent="handleSubmit" class="form">
      <!-- Joueur 1 -->
      <div class="player-section">
        <h3>👤 Joueur 1</h3>
        <div class="input-group">
          <label for="player1Username">Nom d'utilisateur:</label>
          <input 
            id="player1Username"
            v-model="formData.player1Username" 
            type="text" 
            required 
            placeholder="Ex: john_doe"
          />
        </div>
        <div class="input-group">
          <label for="player1Score">Score:</label>
          <input 
            id="player1Score"
            v-model.number="formData.player1Score" 
            type="number" 
            required 
            min="0"
          />
        </div>
      </div>

      <!-- Joueur 2 -->
      <div class="player-section">
        <h3>👤 Joueur 2</h3>
        <div class="input-group">
          <label for="player2Username">Nom d'utilisateur:</label>
          <input 
            id="player2Username"
            v-model="formData.player2Username" 
            type="text" 
            required 
            placeholder="Ex: jane_smith"
          />
        </div>
        <div class="input-group">
          <label for="player2Score">Score:</label>
          <input 
            id="player2Score"
            v-model.number="formData.player2Score" 
            type="number" 
            required 
            min="0"
          />
        </div>
      </div>

      <!-- Durée du match -->
      <div class="duration-section">
        <h3>⏱️ Durée du Match</h3>
        <div class="duration-inputs">
          <div class="input-group">
            <label for="hours">Heures:</label>
            <input 
              id="hours"
              v-model.number="durationParts.hours" 
              type="number" 
              min="0" 
              max="23"
            />
          </div>
          <div class="input-group">
            <label for="minutes">Minutes:</label>
            <input 
              id="minutes"
              v-model.number="durationParts.minutes" 
              type="number" 
              min="0" 
              max="59"
            />
          </div>
          <div class="input-group">
            <label for="seconds">Secondes:</label>
            <input 
              id="seconds"
              v-model.number="durationParts.seconds" 
              type="number" 
              min="0" 
              max="59"
            />
          </div>
        </div>
        <p class="duration-display">
          Durée formatée: <strong>{{ formattedDuration }}</strong>
        </p>
      </div>

      <!-- Gagnant prévu -->
      <div class="winner-section">
        <h3>🏆 Gagnant Prévu</h3>
        <p class="winner-display">
          <span v-if="formData.player1Score > formData.player2Score" class="winner">
            🎉 Joueur 1 gagne ({{ formData.player1Score }} - {{ formData.player2Score }})
          </span>
          <span v-else-if="formData.player2Score > formData.player1Score" class="winner">
            🎉 Joueur 2 gagne ({{ formData.player2Score }} - {{ formData.player1Score }})
          </span>
          <span v-else class="tie">
            🤝 Égalité ({{ formData.player1Score }} - {{ formData.player2Score }})
          </span>
        </p>
      </div>

      <!-- Messages d'erreur -->
      <div v-if="lastError" class="error-message">
        ❌ {{ lastError }}
      </div>

      <!-- Message de succès -->
      <div v-if="lastMatchId && !isLoading" class="success-message">
        ✅ Match sauvegardé avec succès ! ID: {{ lastMatchId }}
      </div>

      <!-- Boutons -->
      <div class="button-group">
        <button 
          type="submit" 
          :disabled="isLoading || !isFormValid"
          class="submit-btn"
        >
          <span v-if="isLoading">⏳ Sauvegarde...</span>
          <span v-else>💾 Sauvegarder Match</span>
        </button>
        
        <button 
          type="button" 
          @click="resetForm"
          class="reset-btn"
        >
          🔄 Réinitialiser
        </button>
      </div>
    </form>

    <!-- Exemple de données -->
    <div class="example-section">
      <h3>📋 Exemples de Données</h3>
      <div class="examples">
        <button @click="loadExample(1)" class="example-btn">
          🏓 Match Rapide (3min)
        </button>
        <button @click="loadExample(2)" class="example-btn">
          ⚡ Match Intense (8min)
        </button>
        <button @click="loadExample(3)" class="example-btn">
          🏆 Match Long (15min)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMatch1v1, type Match1v1Data } from '../composable/useMatch1v1';

// Composable pour la gestion des matches
const { isLoading, lastError, lastMatchId, saveMatch1v1, resetState } = useMatch1v1();

// Données du formulaire
const formData = ref<Match1v1Data>({
  player1Username: 'player1',
  player1Score: 0,
  player2Username: 'player2',
  player2Score: 0,
  gameDuration: '00:05:00'
});

// Parties de la durée pour l'interface
const durationParts = ref({
  hours: 0,
  minutes: 5,
  seconds: 0
});

// Durée formatée
const formattedDuration = computed(() => {
  return `${durationParts.value.hours.toString().padStart(2, '0')}:${durationParts.value.minutes.toString().padStart(2, '0')}:${durationParts.value.seconds.toString().padStart(2, '0')}`;
});

// Mise à jour de la durée dans formData quand durationParts change
watch(formattedDuration, (newDuration) => {
  formData.value.gameDuration = newDuration;
});

// Validation du formulaire
const isFormValid = computed(() => {
  return formData.value.player1Username.trim() !== '' &&
         formData.value.player2Username.trim() !== '' &&
         formData.value.player1Username !== formData.value.player2Username &&
         formData.value.player1Score !== formData.value.player2Score; // Pas d'égalité
});

// Soumission du formulaire
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const result = await saveMatch1v1(formData.value);
  
  if (result.success) {
    console.log('✅ Match sauvegardé avec l\'ID:', result.matchId);
    // Optionnel: réinitialiser le formulaire après succès
    // resetForm();
  } else {
    console.error('❌ Erreur:', result.error);
  }
};

// Réinitialisation du formulaire
const resetForm = () => {
  formData.value = {
    player1Username: 'player1',
    player1Score: 0,
    player2Username: 'player2',
    player2Score: 0,
    gameDuration: '00:05:00'
  };
  durationParts.value = {
    hours: 0,
    minutes: 5,
    seconds: 0
  };
  resetState();
};

// Chargement d'exemples
const loadExample = (exampleNumber: number) => {
  switch (exampleNumber) {
    case 1: // Match rapide
      formData.value = { player1Username: 'alice', player1Score: 11, player2Username: 'bob', player2Score: 7, gameDuration: '00:03:30' };
      durationParts.value = { hours: 0, minutes: 3, seconds: 30 };
      break;
    case 2: // Match intense
      formData.value = { player1Username: 'charlie', player1Score: 15, player2Username: 'david', player2Score: 13, gameDuration: '00:08:15' };
      durationParts.value = { hours: 0, minutes: 8, seconds: 15 };
      break;
    case 3: // Match long
      formData.value = { player1Username: 'eve', player1Score: 21, player2Username: 'frank', player2Score: 19, gameDuration: '00:15:45' };
      durationParts.value = { hours: 0, minutes: 15, seconds: 45 };
      break;
  }
  resetState();
};
</script>

<style scoped>
.match-1v1-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.player-section, .duration-section, .winner-section {
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.input-group label {
  font-weight: 600;
  color: #495057;
}

.input-group input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.duration-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.duration-display {
  text-align: center;
  margin-top: 10px;
  font-size: 18px;
  color: #495057;
}

.winner-display {
  text-align: center;
  font-size: 18px;
  margin: 0;
}

.winner {
  color: #28a745;
  font-weight: bold;
}

.tie {
  color: #ffc107;
  font-weight: bold;
}

.error-message {
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.success-message {
  padding: 12px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.submit-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn {
  background-color: #007bff;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn:hover {
  background-color: #545b62;
}

.example-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #e9ecef;
  border-radius: 8px;
}

.examples {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.example-btn {
  padding: 8px 16px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.example-btn:hover {
  background-color: #138496;
}

h2 {
  text-align: center;
  color: #343a40;
  margin-bottom: 30px;
}

h3 {
  margin: 0 0 15px 0;
  color: #495057;
}
</style>
