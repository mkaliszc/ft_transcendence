import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { randomUUID } from 'crypto';

const server = createServer();
const wss = new WebSocketServer({ server });

const rooms = new Map();

function createRoom() {
  const roomId = randomUUID().slice(0, 6);
  rooms.set(roomId, {
    players: [],
    ball: {
      x: 400,
      y: 300,
      vx: 4,
      vy: 4,
    },
  });
  return roomId;
}

function startGame(roomId) {
  const room = rooms.get(roomId);

  const interval = setInterval(() => {
    const ball = room.ball;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y >= 600) ball.vy *= -1;

    room.players.forEach((p, i) => {
      if (i === 0 && ball.x <= 20 && ball.y >= p.y && ball.y <= p.y + 100) ball.vx *= -1;
      if (i === 1 && ball.x >= 780 && ball.y >= p.y && ball.y <= p.y + 100) ball.vx *= -1;
      if (i === 2 && ball.y <= 20 && ball.x >= p.y && ball.x <= p.y + 100) ball.vy *= -1;
      if (i === 3 && ball.y >= 580 && ball.x >= p.y && ball.x <= p.y + 100) ball.vy *= -1;
    });

    if (ball.x < 0 || ball.x > 800 || ball.y < 0 || ball.y > 600) {
      ball.x = 400;
      ball.y = 300;
      ball.vx *= -1;
      ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }

    const state = {
      type: 'update',
      ball,
      players: room.players.map((p) => p.y),
    };

    room.players.forEach((p) => {
      if (p.readyState === p.OPEN) {
        p.send(JSON.stringify(state));
      }
    });
  }, 30);

  room.interval = interval;
}

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (data.type === 'create') {
      const roomId = createRoom();
      joinRoom(ws, roomId);
      ws.send(JSON.stringify({ type: 'room_created', roomId }));

    } else if (data.type === 'join') {
      if (!rooms.has(data.roomId)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        return;
      }
      joinRoom(ws, data.roomId);
    } else if (data.type === 'move') {
      if (currentRoom) {
        ws.y = data.y;
      }
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      room.players = room.players.filter((p) => p !== ws);
      if (room.players.length === 0) {
        rooms.delete(currentRoom);
      }
    }
  });

  function joinRoom(ws, roomId) {
    const room = rooms.get(roomId);
    if (room.players.length >= 4) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
      return;
    }

    ws.roomId = roomId;
    ws.y = 250;
    room.players.push(ws);
    currentRoom = roomId;

    ws.send(JSON.stringify({ type: 'joined', index: room.players.length - 1, roomId }));

    if (room.players.length === 2 || room.players.length === 4) {
      startGame(roomId);
    }
  }
});

server.listen(3001, () => {
  console.log('Serveur WebSocket prêt sur le port 3001');
});
