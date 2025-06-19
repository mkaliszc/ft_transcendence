import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = 3003;
const games = {};

/** État initial d'une partie */
function createInitialGameState(maxPlayers) {
  return {
    ballX: 400, ballY: 250, ballSize: 10,
    ballSpeedX: 5, ballSpeedY: 3,
    paddles: { player1:200, player2:200, player3:200, player4:200 },
    score:   { player1:0, player2:0, player3:0, player4:0 },
    gameMode: maxPlayers,
    host: 'player1',
    gameStarted: false,
    lastPaddleHit: null
  };
}

/** Broadcast à tous dans la partie */
function broadcastToGame(gameId, msgObj) {
  const room = games[gameId];
  if (!room) return;
  const msg = JSON.stringify(msgObj);
  room.players.forEach(p => {
    if (p.ws.readyState === p.ws.OPEN) p.ws.send(msg);
  });
}

/** Broadcast à tous sauf l'émetteur */
function broadcastToOthers(gameId, senderWs, msgObj) {
  const room = games[gameId];
  if (!room) return;
  const msg = JSON.stringify(msgObj);
  room.players.forEach(p => {
    if (p.ws !== senderWs && p.ws.readyState === p.ws.OPEN) {
      p.ws.send(msg);
    }
  });
}

const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

wss.on('connection', ws => {
  ws.gameId = null;
  ws.playerId = null;
  ws.username = null;

  ws.on('message', raw => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    const { type, payload } = data;

    switch (type) {
      case 'create-game': {
        const maxPlayers = Number(payload.maxPlayers);
        const gameId = randomUUID();
        const initialState = createInitialGameState(maxPlayers);
        const creatorName = payload.username || 'Joueur 1';

        games[gameId] = {
          players: [{ id: 'player1', ws, username: creatorName }],
          maxPlayers,
          gameState: initialState,
          readyPlayers: [],
          playerNames: { player1: creatorName }
        };
        ws.playerId = 'player1';
        ws.gameId   = gameId;
        ws.username = creatorName;

        console.log(`[Server] Partie créée: ${gameId} par player1 (${creatorName})`);
        console.log(`[Server] Noms initiaux:`, games[gameId].playerNames);

        // Ack création
        ws.send(JSON.stringify({
          type: 'game-created',
          payload: { gameId, assignedPlayerId: 'player1' }
        }));
        break;
      }

      case 'join-game': {
        const { gameId: joinId, username } = payload;
        const room = games[joinId];
        if (!room) {
          ws.send(JSON.stringify({ type: 'game-not-found' }));
          return;
        }
        if (room.players.length >= room.maxPlayers) {
          ws.send(JSON.stringify({ type: 'game-full' }));
          return;
        }
        
        // Assigne next free player
        const taken = room.players.map(p=>p.id);
        let assigned;
        for (let i=1; i<=room.maxPlayers; i++) {
          const pid = `player${i}`;
          if (!taken.includes(pid)) { assigned = pid; break; }
        }
        
        const joinerName = username || `Joueur ${assigned.slice(-1)}`;
        
        // CRITIQUE: Vérifier que le nom n'écrase pas un nom existant
        if (room.playerNames[assigned]) {
          console.log(`[Server] ATTENTION: ${assigned} avait déjà le nom ${room.playerNames[assigned]}, conservation`);
        } else {
          room.playerNames[assigned] = joinerName;
          console.log(`[Server] ${assigned} reçoit le nom: ${joinerName}`);
        }
        
        room.players.push({ id: assigned, ws, username: joinerName });
        
        ws.playerId = assigned;
        ws.gameId   = joinId;
        ws.username = joinerName;

        console.log(`[Server] ${assigned} (${joinerName}) rejoint la partie ${joinId}`);
        console.log(`[Server] Noms après join:`, room.playerNames);

        // Ack join - Envoyer une COPIE des noms pour éviter la référence
        ws.send(JSON.stringify({
          type: 'join-success',
          payload: {
            assignedPlayerId: assigned,
            players: room.players.map(p=>p.id),
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers,
            gameState: room.gameState,
            playerNames: { ...room.playerNames } // COPIE pour éviter mutation
          }
        }));
        
        // Broadcast mise à jour - Envoyer une COPIE des noms
        broadcastToGame(joinId, {
          type: 'player-joined',
          payload: {
            players: room.players.map(p=>p.id),
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers,
            gameState: room.gameState,
            playerNames: { ...room.playerNames } // COPIE pour éviter mutation
          }
        });
        break;
      }

      case 'get-players': {
        const { gameId: gpId } = payload;
        const room = games[gpId];
        if (!room) return;
        
        console.log(`[Server] get-players pour ${gpId}`);
        console.log(`[Server] Noms à envoyer:`, room.playerNames);
        
        ws.send(JSON.stringify({
          type: 'player-joined',
          payload: {
            players: room.players.map(p=>p.id),
            playersCount: room.players.length,
            maxPlayers: room.maxPlayers,
            gameState: room.gameState,
            playerNames: { ...room.playerNames } // COPIE
          }
        }));
        break;
      }

      case 'player-ready': {
        const { gameId: prId, playerId: pid } = payload;
        const room = games[prId];
        if (!room) return;
        
        console.log(`[Server] ${pid} (${room.playerNames[pid]}) est prêt`);
        
        if (!room.readyPlayers.includes(pid)) {
          room.readyPlayers.push(pid);
        }
        
        console.log(`[Server] Joueurs prêts: ${room.readyPlayers.length}/${room.maxPlayers}`);
        console.log(`[Server] Noms finaux:`, room.playerNames);
        
        // Si tous prêts → démarrage
        if (room.readyPlayers.length === room.maxPlayers) {
          console.log(`[Server] DÉMARRAGE - Noms:`, room.playerNames);
          room.gameState.gameStarted = true;
          room.gameState.ballX = 400;
          room.gameState.ballY = 250;
          room.gameState.ballSpeedX = Math.random() > 0.5 ? 5 : -5;
          room.gameState.ballSpeedY = Math.random() > 0.5 ? 3 : -3;
          
          broadcastToGame(prId, {
            type: 'all-ready',
            payload: { 
              gameState: room.gameState,
              playerNames: { ...room.playerNames } // COPIE
            }
          });
        }
        break;
      }

      case 'player-move': {
        const { gameId: pmId, playerId: pid, moveData } = payload;
        const room = games[pmId];
        if (!room || !room.gameState.gameStarted) return;
        
        room.gameState.paddles[pid] = moveData.paddlePosition;
        broadcastToOthers(pmId, ws, {
          type: 'opponent-move',
          payload: { playerId: pid, moveData }
        });
        break;
      }

      case 'game-update': {
        const { gameId: guId, gameState: updateState } = payload;
        const room = games[guId];
        if (!room || !room.gameState.gameStarted) return;
        
        if (updateState.ballX !== undefined) room.gameState.ballX = updateState.ballX;
        if (updateState.ballY !== undefined) room.gameState.ballY = updateState.ballY;
        if (updateState.ballSpeedX !== undefined) room.gameState.ballSpeedX = updateState.ballSpeedX;
        if (updateState.ballSpeedY !== undefined) room.gameState.ballSpeedY = updateState.ballSpeedY;
        if (updateState.score) Object.assign(room.gameState.score, updateState.score);
        if (updateState.lastPaddleHit !== undefined) room.gameState.lastPaddleHit = updateState.lastPaddleHit;
        
        broadcastToOthers(guId, ws, {
          type: 'game-update',
          payload: { gameState: updateState }
        });
        break;
      }

      case 'reset-game': {
        const { gameId: rgId } = payload;
        const room = games[rgId];
        if (!room) return;
        
        room.gameState.score = { player1:0, player2:0, player3:0, player4:0 };
        room.gameState.lastPaddleHit = null;
        
        broadcastToGame(rgId, {
          type: 'game-reset',
          payload: { gameState: room.gameState }
        });
        break;
      }

      case 'toggle-pause': {
        const { gameId: tpId, isPaused } = payload;
        const room = games[tpId];
        if (!room) return;
        
        broadcastToGame(tpId, {
          type: 'game-paused',
          payload: { isPaused }
        });
        break;
      }
    }
  });

  ws.on('close', () => {
    const { gameId, playerId } = ws;
    if (!gameId || !playerId) return;
    
    console.log(`[Server] ${playerId} déconnecté de ${gameId}`);
    
    const room = games[gameId];
    if (!room) return;
    
    room.players = room.players.filter(p=>p.id!==playerId);
    room.readyPlayers = room.readyPlayers.filter(r=>r!==playerId);
    delete room.playerNames[playerId];
    
    if (room.players.length === 0) {
      console.log(`[Server] Suppression de la partie vide ${gameId}`);
      delete games[gameId];
    } else {
      broadcastToGame(gameId, {
        type: 'player-joined',
        payload: {
          players: room.players.map(p=>p.id),
          playersCount: room.players.length,
          maxPlayers: room.maxPlayers,
          gameState: room.gameState,
          playerNames: room.playerNames
        }
      });
    }
  });
});

console.log(`[Server] WebSocket server démarré sur le port ${PORT}`);