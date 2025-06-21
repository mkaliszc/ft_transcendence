import { ref, computed, onMounted } from 'vue';
import { 
  getFriends,
  getPendingRequests,
  sendFriendRequest as sendFriendRequestAPI,
  acceptFriendRequest as acceptFriendRequestAPI,
  declineFriendRequest as declineFriendRequestAPI,
  removeFriend as removeFriendAPI,
  getFriendsOnlineStatus,
  type Friendship, 
  type FriendRequest, 
  type ApiResponse 
} from '../services/friendsAPI';

export function useFriends() {
  // État réactif
  const friends = ref<Friendship[]>([]);
  const pendingRequests = ref<FriendRequest[]>([]);
  const onlineStatus = ref<Record<number, boolean>>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties - Pour l'instant, on affiche tous les amis comme "en ligne"
  // car nous n'avons pas de système de présence en temps réel
  const onlineFriends = computed<Friendship[]>(() => 
    friends.value // Tous les amis sont considérés comme "en ligne"
  );

  const offlineFriends = computed<Friendship[]>(() => 
    [] // Aucun ami "hors ligne" pour l'instant
  );

  const onlineFriendsCount = computed(() => onlineFriends.value.length);
  const totalFriendsCount = computed(() => friends.value.length);
  const pendingRequestsCount = computed(() => pendingRequests.value.length);

  // Méthodes
  const loadFriends = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await getFriends();
      if (response.success) {
        friends.value = response.data || [];
      } else {
        error.value = response.error || 'Erreur lors du chargement des amis';
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des amis';
    } finally {
      isLoading.value = false;
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await getPendingRequests();
      if (response.success) {
        pendingRequests.value = response.data || [];
      }
    } catch (err: any) {
      // Erreur silencieuse lors du chargement des demandes
    }
  };

  const loadOnlineStatus = async () => {
    try {
      const response = await getFriendsOnlineStatus();
      if (response.success) {
        onlineStatus.value = response.data || {};
      }
    } catch (err: any) {
      // Erreur silencieuse lors du chargement du statut en ligne
    }
  };

  const acceptRequest = async (requestId: number): Promise<ApiResponse> => {
    try {
      const response = await acceptFriendRequestAPI(requestId);
      if (response.success) {
        // Supprimer la demande de la liste
        pendingRequests.value = pendingRequests.value.filter(req => req.friendship_id !== requestId);
        // Recharger la liste des amis
        await loadFriends();
      }
      return response;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erreur lors de l\'acceptation'
      };
    }
  };

  const rejectRequest = async (requestId: number): Promise<ApiResponse> => {
    try {
      const response = await declineFriendRequestAPI(requestId);
      if (response.success) {
        // Supprimer la demande de la liste
        pendingRequests.value = pendingRequests.value.filter(req => req.friendship_id !== requestId);
      }
      return response;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erreur lors du rejet'
      };
    }
  };

  const removeFriendship = async (friendshipId: number): Promise<ApiResponse> => {
    try {
      const response = await removeFriendAPI(friendshipId);
      if (response.success) {
        // Supprimer l'ami de la liste
        friends.value = friends.value.filter(friendship => friendship.friendship_id !== friendshipId);
      }
      return response;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erreur lors de la suppression'
      };
    }
  };

  const sendRequest = async (username: string): Promise<ApiResponse> => {
    try {
      return await sendFriendRequestAPI(username);
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erreur lors de l\'envoi de la demande'
      };
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadFriends(),
      loadPendingRequests(),
      loadOnlineStatus()
    ]);
  };

  // Initialisation
  onMounted(() => {
    refreshData();
    
    // Rafraîchir le statut en ligne toutes les 30 secondes
    const interval = setInterval(loadOnlineStatus, 30000);
    
    // Nettoyer l'intervalle lors de la destruction du composant
    return () => clearInterval(interval);
  });

  return {
    // État
    friends,
    pendingRequests,
    onlineStatus,
    isLoading,
    error,
    
    // Computed
    onlineFriends,
    offlineFriends,
    onlineFriendsCount,
    totalFriendsCount,
    pendingRequestsCount,
    
    // Méthodes
    loadFriends,
    loadPendingRequests,
    loadOnlineStatus,
    acceptFriendRequest: acceptRequest,
    rejectFriendRequest: rejectRequest,
    removeFriend: removeFriendship,
    sendFriendRequest: sendRequest,
    refreshData
  };
}