// server.js
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = 3002;

// Structure mémoire des parties
// Chaque partie (clé = gameId) stocke :
//   - players     : tableau d’objets { id: 'player1', ws: WebSocket }
//   - maxPlayers  : nombre maximal de joueurs (2 ou 4)
//   - gameState   : état du jeu (balle, raquettes, score, gameStarted)
//   - readyPlayers: tableau des playerId qui ont cliqué “player-ready”
const games = {};

// Fonction utilitaire pour initialiser gameState
function createInitialGameState(maxPlayers) {
  return {
    ballX: 400,
    ballY: 250,
    ballSize: 10,
    ballSpeedX: 5,
    ballSpeedY: 3,
    paddles: {
      player1: 200,
      player2: 200,
      player3: 200,
      player4: 200
    },
    score: {
      player1: 0,
      player2: 0,
      player3: 0,
      player4: 0
    },
    gameMode: maxPlayers,    // 2 ou 4
    host: 'player1',         // l’hôte sera toujours player1
    gameStarted: false
  };
}

// Envoie un objet JSON à tous les WebSocket connectés dans la partie
function broadcastToGame(gameId, messageObj) {
  const room = games[gameId];
  if (!room) return;
  const msg = JSON.stringify(messageObj);
  room.players.forEach(({ ws }) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  });
}

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

wss.on('connection', (ws) => {
  // À la connexion, on ne connaît pas encore gameId ni playerId
  ws.gameId = null;
  ws.playerId = null;

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (err) {
      console.error('Invalid JSON reçu :', raw.toString());
      return;
    }

    const { type, payload } = data;
    console.log('Server received:', type, payload);

    switch (type) {
      // --------------------------
      // 1) Création d’une partie
      // --------------------------
      case 'create-game': {
        const { maxPlayers } = payload; // 2 ou 4
        const gameId = randomUUID();
        const initialState = createInitialGameState(maxPlayers);

        // On crée la nouvelle “room”
        games[gameId] = {
          players: [{ id: 'player1', ws }],
          maxPlayers,
          gameState: initialState,
          readyPlayers: [] // personne n’est prêt au démarrage
        };

        // On mémorise dans ws
        ws.playerId = 'player1';
        ws.gameId = gameId;

        // On informe l’hôte que la partie est créée
        ws.send(
          JSON.stringify({
            type: 'game-created',
            payload: {
              gameId,
              assignedPlayerId: 'player1'
            }
          })
        );

        // On broadcast que player1 a rejoint (même si c’est l’hôte)
        broadcastToGame(gameId, {
          type: 'player-joined',
          payload: {
            players: games[gameId].players.map((p) => p.id),
            playersCount: games[gameId].players.length,
            maxPlayers: games[gameId].maxPlayers,
            gameState: games[gameId].gameState
          }
        });
        break;
      }

      // --------------------------
      // 2) Rejoindre une partie
      // --------------------------
      case 'join-game': {
        const { gameId: joinId } = payload;
        const room = games[joinId];
        if (!room) {
          ws.send(JSON.stringify({ type: 'game-not-found' }));
          return;
        }
        if (room.players.length >= room.maxPlayers) {
          ws.send(JSON.stringify({ type: 'game-full' }));
          return;
        }

        // On attribue le premier playerX libre
        const taken = room.players.map((p) => p.id);
        let assigned = null;
        for (let i = 1; i <= room.maxPlayers; i++) {
          const testId = `player${i}`;
          if (!taken.includes(testId)) {
            assigned = testId;
            break;
          }
        }
        if (!assigned) {
          ws.send(JSON.stringify({ type: 'error', payload: { message: 'Impossible d’assigner un ID' } }));
          return;
        }

        // On ajoute le joueur à la room
        room.players.push({ id: assigned, ws });
        ws.playerId = assigned;
        ws.gameId = joinId;

        // On envoie un “join-success” à celui qui vient de rejoindre
        ws.send(
          JSON.stringify({
            type: 'join-success',
            payload: {
              assignedPlayerId: assigned,
              players: room.players.map((p) => p.id),
              playersCount: room.players.length,
              maxPlayers: room.maxPlayers,
              gameState: room.gameState
            }
          })
        );

        // On broadcast à tous (y compris l’hôte) que playerX a rejoint
        broadcastToGame(joinId, {
          type: 'player-joined',
          payload: {
            players: room.players.map((p) => p.id),
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers,
            gameState: room.gameState
          }
        });
        break;
      }

      // -----------------------------------
      // 3) Récupérer la liste des joueurs
      // -----------------------------------
      case 'get-players': {
        const { gameId: gpId } = payload;
        const room = games[gpId];
        if (!room) return;
        ws.send(
          JSON.stringify({
            type: 'player-joined',
            payload: {
              players: room.players.map((p) => p.id),
              playersCount: room.players.length,
              maxPlayers: room.maxPlayers,
              gameState: room.gameState
            }
          })
        );
        break;
      }

      // --------------------------
      // 4) Joueur prêt (“player-ready”)
      // --------------------------
      case 'player-ready': {
        const { gameId: prId, playerId: pid } = payload;
        const room = games[prId];
        if (!room) return;

        // On ajoute pid à readyPlayers s'il n’y est pas déjà
        if (!room.readyPlayers.includes(pid)) {
          room.readyPlayers.push(pid);
        }

        console.log(`Room ${prId} → joueurs prêts : `, room.readyPlayers);

        // Si tous les joueurs inscrits sont prêts, on démarre la partie
        // i.e. si liste readyPlayers.length === room.maxPlayers
        if (room.readyPlayers.length === room.maxPlayers) {
          // On marque gameStarted = true
          room.gameState.gameStarted = true;

          // On broadcast “all-ready” avec l’état initial du jeu
          broadcastToGame(prId, {
            type: 'all-ready',
            payload: {
              gameState: room.gameState
            }
          });
        }
        break;
      }

      // -----------------------------------
      // 5) Mouvement d’un joueur (“player-move”)
      // -----------------------------------
      case 'player-move': {
        const { gameId: gmId, playerId: movePid, moveData } = payload;
        const room = games[gmId];
        if (!room || !room.gameState.gameStarted) return;

        // On met à jour la position de la raquette
        room.gameState.paddles[movePid] = moveData.paddlePosition;

        // On broadcast pour que les autres voient ce mouvement
        broadcastToGame(gmId, {
          type: 'opponent-move',
          payload: {
            playerId: movePid,
            moveData
          }
        });
        break;
      }

      // -----------------------------------
      // 6) Mise à jour du jeu (“game-update”)
      // -----------------------------------
      case 'game-update': {
        const { gameId: upId, gameState: newState } = payload;
        const room = games[upId];
        if (!room) return;

        // On remplace l’état interne
        room.gameState = newState;

        // On rebroadcast la nouvelle version du gameState à tous
        broadcastToGame(upId, {
          type: 'game-update',
          payload: {
            gameState: newState
          }
        });
        break;
      }

      // -----------------------------------
      // 7) Autres cas / erreurs
      // -----------------------------------
      default:
        console.warn('Type non géré par serveur :', type);
        break;
    }
  });

  ws.on('close', () => {
    const gId = ws.gameId;
    const pId = ws.playerId;
    if (!gId || !games[gId]) return;

    const room = games[gId];
    // On retire ce joueur
    room.players = room.players.filter((p) => p.id !== pId);
    room.readyPlayers = room.readyPlayers.filter((r) => r !== pId);

    // Si plus aucun joueur, on supprime la room
    if (room.players.length === 0) {
      delete games[gId];
      return;
    }

    // Sinon, on informe les autres qu’un joueur est parti
    broadcastToGame(gId, {
      type: 'player-joined',
      payload: {
        players: room.players.map((p) => p.id),
        playersCount: room.players.length,
        maxPlayers: room.maxPlayers,
        gameState: room.gameState
      }
    });
  });
});
