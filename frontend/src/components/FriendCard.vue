<template>
  <div class="friend-card" :class="{ 'online': isOnline }">
    <!-- Avatar avec indicateur de statut -->
    <div class="avatar-container">
      <div class="avatar default-avatar">
        <div class="avatar-placeholder">
          {{ displayName.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div class="status-indicator" :class="{ 'online': isOnline, 'offline': !isOnline }"></div>
    </div>

    <!-- Informations de l'ami -->
    <div class="friend-info">
      <h3 class="friend-name">{{ displayName }}</h3>
      <p class="friend-username">@{{ friendship.friend.username }}</p>
      <div class="friend-status">
        <i :class="statusIcon"></i>
        <span>{{ statusText }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="friend-actions">
      <!-- Actions pour ami en ligne -->
      <div v-if="isOnline" class="online-actions">
        <button 
          @click="$emit('invite-game', friendship)" 
          class="btn-action btn-game"
          title="Inviter à jouer"
        >
          <i class="fas fa-gamepad"></i>
        </button>
        <button 
          @click="$emit('view-profile', friendship)" 
          class="btn-action btn-profile"
          title="Voir le profil"
        >
          <i class="fas fa-user"></i>
        </button>
      </div>
      
      <!-- Actions pour ami hors ligne -->
      <div v-else class="offline-actions">
        <button 
          @click="$emit('view-profile', friendship)" 
          class="btn-action btn-profile"
          title="Voir le profil"
        >
          <i class="fas fa-user"></i>
        </button>
      </div>

      <!-- Menu d'options -->
      <div class="options-menu" ref="optionsMenu">
        <button @click="toggleOptions" class="btn-options" title="Options">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        
        <div v-if="showOptions" class="options-dropdown">
          <button @click="handleViewProfile" class="option-item">
            <i class="fas fa-user"></i>
            Voir le profil
          </button>
          <button @click="handleInviteGame" class="option-item" v-if="isOnline">
            <i class="fas fa-gamepad"></i>
            Inviter à jouer
          </button>
          <hr class="option-divider">
          <button @click="handleRemove" class="option-item remove">
            <i class="fas fa-user-minus"></i>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Friendship } from '../services/friendsAPI';

// Props
const props = defineProps<{
  friendship: Friendship;
  isOnline: boolean;
}>();

// Émissions
const emit = defineEmits<{
  'invite-game': [friendship: Friendship];
  'view-profile': [friendship: Friendship];
  'remove': [friendshipId: number];
}>();

// État local
const showOptions = ref(false);
const optionsMenu = ref<HTMLElement>();

// Computed
const displayName = computed(() => 
  props.friendship.friend.username
);

const statusIcon = computed(() => 
  props.isOnline ? 'fas fa-circle' : 'fas fa-circle'
);

const statusText = computed(() => 
  props.isOnline ? 'En ligne' : 'Hors ligne'
);

// Méthodes
const toggleOptions = () => {
  showOptions.value = !showOptions.value;
};

const closeOptions = (event: Event) => {
  if (optionsMenu.value && !optionsMenu.value.contains(event.target as Node)) {
    showOptions.value = false;
  }
};

const handleViewProfile = () => {
  emit('view-profile', props.friendship);
  showOptions.value = false;
};

const handleInviteGame = () => {
  emit('invite-game', props.friendship);
  showOptions.value = false;
};

const handleRemove = () => {
  if (confirm(`Supprimer ${displayName.value} de vos amis ?`)) {
    emit('remove', props.friendship.friendship_id);
  }
  showOptions.value = false;
};

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeOptions);
});

onUnmounted(() => {
  document.removeEventListener('click', closeOptions);
});
</script>

<style scoped>
.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.friend-card.online {
  border-color: rgba(40, 167, 69, 0.3);
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar.default-avatar {
  background: linear-gradient(135deg, #d4af37, #c19b2e);
}

.avatar-placeholder {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  text-align: center;
}

.friend-card.online .avatar {
  border-color: rgba(40, 167, 69, 0.5);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.8);
  transition: background-color 0.3s ease;
}

.status-indicator.online {
  background-color: #28a745;
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
}

.status-indicator.offline {
  background-color: #6c757d;
}

.friend-info {
  flex: 1;
  min-width: 0; /* Pour permettre le text-overflow */
}

.friend-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8f9fa;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-username {
  font-size: 0.9rem;
  color: #adb5bd;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.friend-status i {
  font-size: 0.6rem;
}

.friend-card.online .friend-status {
  color: #28a745;
}

.friend-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.online-actions,
.offline-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-game {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-game:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.btn-profile {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.btn-profile:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
}

.options-menu {
  position: relative;
}

.btn-options {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #adb5bd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-options:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f8f9fa;
}

.options-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 180px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  text-align: left;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.option-item.remove {
  color: #ff6b6b;
}

.option-item.remove:hover {
  background: rgba(220, 53, 69, 0.2);
}

.option-divider {
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .friend-card {
    padding: 1rem;
  }
  
  .avatar {
    width: 50px;
    height: 50px;
  }
  
  .friend-name {
    font-size: 1rem;
  }
  
  .btn-action {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .online-actions {
    display: none; /* Masquer sur mobile, utiliser le menu */
  }
}
</style>