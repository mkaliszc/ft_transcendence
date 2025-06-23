<template>
  <div class="friend-card" :class="{ 'online': isOnline }">
    <div class="avatar-container">
      <div class="avatar default-avatar">
        <div class="avatar-placeholder">
          {{ displayName.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div class="status-indicator" :class="{ 'online': isOnline, 'offline': !isOnline }"></div>
    </div>
    <div class="friend-info">
      <h3 class="friend-name">{{ displayName }}</h3>
      <span class="friend-username">@{{ friendship.friend.username }}</span>
      <div class="friend-status">
        <i :class="statusIcon"></i>
        <span>{{ statusText }}</span>
      </div>
    </div>
    <div class="friend-actions">
      <button 
        @click="$emit('view-profile', friendship)" 
        class="btn-action btn-profile"
        title="Voir le profil de cet ami"
      >
        <i class="fas fa-id-card"></i>
        <span class="btn-label">Profil</span>
      </button>
      <button 
        @click="handleRemove" 
        class="btn-action btn-remove"
        title="Supprimer de la liste d'amis"
      >
        <i class="fas fa-user-minus"></i>
        <span class="btn-label">Supprimer</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Friendship } from '../../services/friendsAPI';

// Props
const props = defineProps<{
  friendship: Friendship;
  isOnline: boolean;
}>();

// Émissions
const emit = defineEmits<{
  'view-profile': [friendship: Friendship];
  'remove': [friendshipId: number];
}>();

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
const handleRemove = () => {
  if (confirm(`Supprimer ${displayName.value} de vos amis ?`)) {
    emit('remove', props.friendship.friendship_id);
  }
};

// Lifecycle
</script>

<style scoped>
.friend-card {
  display: flex;
  align-items: center;
  gap: 2.2rem;
  padding: 2.2rem 2.2rem 1.7rem 2.2rem;
  min-height: 130px;
  background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
  backdrop-filter: blur(10px);
  border-radius: 1.2rem;
  border: 1.5px solid #2d5a3d;
  box-shadow: 0 6px 32px rgba(40, 87, 42, 0.18);
  transition: all 0.3s cubic-bezier(.4,2,.6,1);
  position: relative;
  overflow: hidden;
}

.friend-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 32px rgba(40, 87, 42, 0.28);
  border-color: #d4af37;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 3px solid #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #d4af37, #c19b2e);
}

.avatar-placeholder {
  font-size: 2.1rem;
  font-weight: bold;
  color: #1a1a1a;
  text-align: center;
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.2rem;
}

.friend-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.1rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
}

.friend-username {
  font-size: 1.05rem;
  color: #ffe082;
  font-weight: 500;
  margin-bottom: 0.1rem;
  margin-top: -0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  color: #b6e7c9;
  font-weight: 500;
}

.friend-status i {
  font-size: 0.7rem;
}

.friend-card.online .friend-status {
  color: #7fff9e;
}

.friend-actions {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  flex-wrap: wrap;
  margin-left: 2.7rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 36px;
  height: 40px;
  padding: 0 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.4,2,.6,1);
  font-size: 1.05rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.btn-profile {
  background: linear-gradient(135deg, #d4af37, #c19b2e);
  color: #1a1a1a;
  border: none;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.10);
}

.btn-profile:hover {
  background: linear-gradient(135deg, #ffe082, #d4af37);
  color: #1a1a1a;
  transform: scale(1.07);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.18);
}

.btn-remove {
  background: linear-gradient(135deg, #1a472a, #2d5a3d);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(40, 87, 42, 0.10);
}

.btn-remove:hover {
  background: linear-gradient(135deg, #2d5a3d, #1a472a);
  color: #fff;
  transform: scale(1.07);
  box-shadow: 0 4px 15px rgba(40, 87, 42, 0.18);
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
</style>