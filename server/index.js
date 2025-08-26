const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
app.get('/', (_req, res) => res.status(200).send('OK'));

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*' }
});

let waitingSocketId = null; // socket.id of the player waiting for quick match
const rooms = new Map(); // roomId -> { white: socketId, black: socketId }
const privateWaiting = new Map(); // roomId -> { socketId, timeLimitSeconds }

function genId(){
	return Math.random().toString(36).slice(2, 10);
}

function safeEmit(socket, event, payload){
	try { socket.emit(event, payload); } catch(_e){}
}

io.on('connection', (socket) => {
	// Attach helpers on socket
	socket.data.roomId = null;
	socket.data.color = null;

	function cleanupRoom(){
		const roomId = socket.data.roomId;
		if(!roomId) return;
		const room = rooms.get(roomId);
		if(room){
			const otherId = (socket.id === room.white) ? room.black : room.white;
			if(otherId){
				const other = io.sockets.sockets.get(otherId);
				if(other){ safeEmit(other, 'opponent_left'); }
			}
			rooms.delete(roomId);
		}
		// If creator was waiting in private room
		const waiting = privateWaiting.get(roomId);
		if(waiting && waiting.socketId === socket.id){
			privateWaiting.delete(roomId);
		}
		socket.leave(roomId);
		socket.data.roomId = null;
		socket.data.color = null;
	}

	socket.on('create', () => {
		// Quick match: place in waiting or start with the waiting player
		if(waitingSocketId){
			const first = io.sockets.sockets.get(waitingSocketId);
			waitingSocketId = null;
			if(!first) return;
			const roomId = genId();
			const timeLimitSeconds = 300;
			rooms.set(roomId, { white: first.id, black: socket.id });
			first.data.roomId = roomId; first.data.color = 'white'; first.join(roomId);
			socket.data.roomId = roomId; socket.data.color = 'black'; socket.join(roomId);
			safeEmit(first, 'start', { roomId, color: 'white', timeLimitSeconds });
			safeEmit(socket, 'start', { roomId, color: 'black', timeLimitSeconds });
		} else {
			const roomId = genId();
			waitingSocketId = socket.id;
			socket.data.roomId = roomId;
			socket.data.color = 'white';
			safeEmit(socket, 'waiting', { roomId });
		}
	});

	socket.on('find', () => {
		// Alias to create quick match
		if(waitingSocketId){
			const first = io.sockets.sockets.get(waitingSocketId);
			waitingSocketId = null;
			if(!first) return;
			const roomId = first.data.roomId || genId();
			const timeLimitSeconds = 300;
			rooms.set(roomId, { white: first.id, black: socket.id });
			first.data.roomId = roomId; first.data.color = 'white'; first.join(roomId);
			socket.data.roomId = roomId; socket.data.color = 'black'; socket.join(roomId);
			safeEmit(first, 'start', { roomId, color: 'white', timeLimitSeconds });
			safeEmit(socket, 'start', { roomId, color: 'black', timeLimitSeconds });
		} else {
			const roomId = genId();
			waitingSocketId = socket.id;
			socket.data.roomId = roomId;
			socket.data.color = 'white';
			safeEmit(socket, 'waiting', { roomId });
		}
	});

	socket.on('create_room', (payload = {}) => {
		let roomId;
		do { roomId = genId(); } while (rooms.has(roomId) || privateWaiting.has(roomId));
		socket.data.roomId = roomId;
		socket.data.color = 'white';
		const timeLimitSeconds = Number(payload.timeLimitSeconds) > 0 ? Number(payload.timeLimitSeconds) : 300;
		privateWaiting.set(roomId, { socketId: socket.id, timeLimitSeconds });
		socket.join(roomId);
		safeEmit(socket, 'room_created', { roomId });
	});

	socket.on('join_room', (payload) => {
		const roomId = String(payload?.roomId || '').trim();
		if(!roomId || rooms.has(roomId)){
			safeEmit(socket, 'error', { error: 'room_not_found' });
			return;
		}
		const waitingEntry = privateWaiting.get(roomId);
		const firstId = waitingEntry && waitingEntry.socketId;
		if(!firstId || firstId === socket.id){
			safeEmit(socket, 'error', { error: 'room_not_found' });
			return;
		}
		privateWaiting.delete(roomId);
		rooms.set(roomId, { white: firstId, black: socket.id });
		const first = io.sockets.sockets.get(firstId);
		if(!first){
			safeEmit(socket, 'error', { error: 'room_not_found' });
			return;
		}
		const timeLimitSeconds = waitingEntry?.timeLimitSeconds || 300;
		first.data.roomId = roomId; first.data.color = 'white'; first.join(roomId);
		socket.data.roomId = roomId; socket.data.color = 'black'; socket.join(roomId);
		safeEmit(first, 'start', { roomId, color: 'white', timeLimitSeconds });
		safeEmit(socket, 'start', { roomId, color: 'black', timeLimitSeconds });
	});

	socket.on('move', (payload) => {
		const roomId = payload?.roomId;
		if(!roomId) return;
		if(!rooms.has(roomId)) return;
		socket.to(roomId).emit('move', {
			roomId,
			from: payload?.from,
			to: payload?.to,
			promotionType: payload?.promotionType
		});
	});

	socket.on('disconnect', () => {
		if(waitingSocketId === socket.id){
			waitingSocketId = null;
		}
		cleanupRoom();
	});
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
	console.log(`Socket.IO server running on http://localhost:${PORT}`);
}); 