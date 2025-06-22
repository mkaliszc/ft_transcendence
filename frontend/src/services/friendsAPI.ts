import { fetchWithAuth } from './api';

// Interfaces adapted to match backend responses
export interface User {
  user_id: number;
  username: string;
  display_name?: string;
  email?: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface Friendship {
  friendship_id: number;
  user_id1: number;
  user_id2: number;
  status: 'pending' | 'accepted'| 'none';
  creation_date: string;
  friend: {
    username: string;
  };
}

export interface FriendRequest {
  friendship_id: number;
  sender: {
    username: string;
  };
  creation_date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Get user's friends list
export const getFriends = async (): Promise<ApiResponse<Friendship[]>> => {
  try {
    const response = await fetchWithAuth('/profile/friendList');
    return {
      success: true,
      data: response.friends || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch friends'
    };
  }
};

// Get pending friend requests (sent BY the current user)
export const getPendingRequests = async (): Promise<ApiResponse<FriendRequest[]>> => {
  try {
    const response = await fetchWithAuth('/profile/friendRequest/pending');
    return {
      success: true,
      data: response.pending_requests || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch friend requests'
    };
  }
};

// Send friend request
export const sendFriendRequest = async (username: string): Promise<ApiResponse<void>> => {
  try {
    await fetchWithAuth(`/profile/friendRequest/${username}`, {
      method: 'POST'
    });
    return {
      success: true
    };
  } catch (error) {
    
    // Gestion spécifique des erreurs
    let errorMessage = 'Échec de l\'envoi de la demande d\'ami';
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('already friends') || message.includes('déjà ami')) {
        errorMessage = 'Vous êtes déjà ami avec cet utilisateur';
      } else if (message.includes('already sent') || message.includes('déjà envoyé')) {
        errorMessage = 'Demande d\'ami déjà envoyée';
      } else if (message.includes('not found') || message.includes('non trouvé')) {
        errorMessage = 'Utilisateur non trouvé';
      } else if (message.includes('declined') || message.includes('refusé')) {
        errorMessage = 'Cet utilisateur a refusé votre demande précédente';
      } else if (message.includes('requête invalide') || message.includes('bad request')) {
        errorMessage = 'Impossible d\'envoyer la demande. Vérifiez le nom d\'utilisateur.';
      } else if (message.includes('erreur serveur') || message.includes('internal server')) {
        errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Accept friend request
export const acceptFriendRequest = async (friendship_id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth('/profile/friendRequest/accept', {
      method: 'PATCH',
      body: JSON.stringify({ friendship_id })
    });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept friend request'
    };
  }
};

// Decline friend request
export const declineFriendRequest = async (friendship_id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth('/profile/friendRequest/decline', {
      method: 'PATCH',
      body: JSON.stringify({ friendship_id })
    });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decline friend request'
    };
  }
};

// Remove friend
export const removeFriend = async (friendship_id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithAuth('/profile/friendRequest/delete', {
      method: 'PATCH',
      body: JSON.stringify({ friendship_id })
    });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove friend'
    };
  }
};

// Get incoming friend requests (received BY the current user)
// Note: This endpoint doesn't exist in the backend yet, so we'll return empty for now
export const getIncomingRequests = async (): Promise<ApiResponse<FriendRequest[]>> => {
  try {
    // This would be a new endpoint like '/profile/friendRequest/incoming'
    // For now, return empty array since the backend doesn't have this endpoint
    return {
      success: true,
      data: []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch incoming requests'
    };
  }
};

// Search users - using profile endpoint to search by username
export const searchUsers = async (query: string): Promise<ApiResponse<User[]>> => {
  try {
    const response = await fetchWithAuth(`/profile/user/${query}`);
    
    // If user found, return as array
    if (response) {
      return {
        success: true,
        data: [{
          user_id: response.user_id,
          username: response.username,
          display_name: response.display_name,
          email: response.email,
          avatar: response.avatar
        }]
      };
    }
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    // If it's a 404, just return empty results instead of an error
    if (error instanceof Error && error.message.includes('404')) {
      return {
        success: true,
        data: []
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users'
    };
  }
};

// Get friends' online status - simplified implementation
export const getFriendsOnlineStatus = async (): Promise<ApiResponse<{ [userId: number]: boolean }>> => {
  try {
    // For now, we'll return a simple status
    // In a real implementation, you'd have a proper presence/status API
    return {
      success: true,
      data: {}
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch online status'
    };
  }
};

// Aliases for backward compatibility
export const rejectFriendRequest = declineFriendRequest;