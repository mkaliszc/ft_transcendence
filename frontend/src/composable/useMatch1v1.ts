/**
 * Composable Vue.js pour la gestion des matches 1v1
 * 
 * Ce fichier peut être placé dans src/composable/useMatch1v1.ts
 * et utilisé dans vos composants Vue pour sauvegarder les matches
 */

import { ref } from 'vue';
import { matchApi } from '../services/matchAPI';

export interface Match1v1Data {
  player1Username: string;
  player1Score: number;
  player2Username: string;
  player2Score: number;
  gameDuration: string; // Format "HH:MM:SS"
}

export interface Match1v1Result {
  success: boolean;
  matchId?: number;
  error?: string;
}

export function useMatch1v1() {
  const isLoading = ref(false);
  const lastError = ref<string | null>(null);
  const lastMatchId = ref<number | null>(null);

  /**
   * Sauvegarde un match 1v1 dans la base de données
   */
  const saveMatch1v1 = async (matchData: Match1v1Data): Promise<Match1v1Result> => {
    isLoading.value = true;
    lastError.value = null;

    try {
      // Validation des données
      if (matchData.player1Username === matchData.player2Username) {
        throw new Error('Les deux joueurs ne peuvent pas avoir le même nom d\'utilisateur');
      }

      if (matchData.player1Score < 0 || matchData.player2Score < 0) {
        throw new Error('Les scores ne peuvent pas être négatifs');
      }

      if (!matchData.gameDuration.match(/^\d{2}:\d{2}:\d{2}$/)) {
        throw new Error('Format de durée invalide. Utilisez HH:MM:SS');
      }

      // Déterminer le gagnant
      const player1Wins = matchData.player1Score > matchData.player2Score;
      
      // Préparer les données pour l'API
      const apiData = {
        Players: [
          {
            username: matchData.player1Username,
            score: matchData.player1Score,
            is_winner: player1Wins
          },
          {
            username: matchData.player2Username,
            score: matchData.player2Score,
            is_winner: !player1Wins
          }
        ],
        game_duration: matchData.gameDuration
      };

      // Appel à l'API
      const result = await matchApi.saveMatch(apiData);
      
      lastMatchId.value = result.match_id;
      
      // ✅ NOUVEAU : Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('matchCompleted', {
        detail: {
          matchId: result.match_id,
          players: apiData.Players,
          duration: apiData.game_duration
        }
      }));
      
      return {
        success: true,
        matchId: result.match_id
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur inconnue lors de la sauvegarde';
      lastError.value = errorMessage;
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Formats a duration in seconds to HH:MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Réinitialise les erreurs et l'état
   */
  const resetState = () => {
    lastError.value = null;
    lastMatchId.value = null;
  };

  return {
    // État
    isLoading,
    lastError,
    lastMatchId,
    
    // Méthodes
    saveMatch1v1,
    formatDuration,
    resetState
  };
}
