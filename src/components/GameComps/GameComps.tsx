import Chessboard from "../Chessboard/Chessboard";
import "./GameComps.css"
import LoginComponent from "../../Login/LoginComponent";
import { useMemo, useState } from "react";
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

function GameComps(){
	const [socket, setSocket] = useState<Socket | null>(null);
	const [status, setStatus] = useState<"offline" | "waiting" | "playing">("offline");
	const [roomId, setRoomId] = useState<string | null>(null);
	const [myColor, setMyColor] = useState<"white" | "black" | null>(null);
	const [joinCode, setJoinCode] = useState<string>("");
	const [showLogin, setShowLogin] = useState<boolean>(false);
	const [selectedTime, setSelectedTime] = useState<number>(300);
	const [activeTimeLimit, setActiveTimeLimit] = useState<number | null>(null);
	const [joinEffectActive, setJoinEffectActive] = useState<boolean>(false);
	const [joinEffectPos, setJoinEffectPos] = useState<{x:number,y:number} | null>(null);

	function ensureSocket(): Socket{
		if(socket && (status === "waiting" || status === "playing")) return socket;
		const s = io(SOCKET_URL, { autoConnect: true });
		s.on('waiting', (msg: any) => {
			setStatus("waiting");
			setRoomId(msg.roomId);
		});
		s.on('start', (msg: any) => {
			setRoomId(msg.roomId);
			setMyColor(msg.color === "white" ? "white" : "black");
			setActiveTimeLimit(typeof msg.timeLimitSeconds === 'number' ? msg.timeLimitSeconds : null);
			setStatus("playing");
		});
		s.on('opponent_left', () => {
			setStatus("offline");
			setRoomId(null);
			setMyColor(null);
			setActiveTimeLimit(null);
			try{ s.close(); } catch {}
		});
		s.on('room_created', (msg: any) => {
			setStatus("waiting");
			setRoomId(msg.roomId);
		});
		s.on('error', (msg: any) => {
			alert(msg?.error || "Error");
		});
		s.on('disconnect', () => {
			setStatus("offline");
			setRoomId(null);
			setMyColor(null);
			setSocket(null);
			setActiveTimeLimit(null);
		});
		setSocket(s);
		return s;
	}

	function createPrivateRoom(){
		const s = ensureSocket();
		s.emit('create_room', { timeLimitSeconds: selectedTime });
	}

	function joinPrivateRoom(){
		const code = joinCode.trim();
		if(!code) return;
		const s = ensureSocket();
		s.emit('join_room', { roomId: code });
	}

	function handleJoinClick(e: React.MouseEvent<HTMLButtonElement>){
		setJoinEffectPos({ x: e.clientX, y: e.clientY });
		setJoinEffectActive(true);
		joinPrivateRoom();
	}

	function disconnect(){
		try{ socket?.close(); } catch {}
		setStatus("offline");
		setRoomId(null);
		setMyColor(null);
		setSocket(null);
		setActiveTimeLimit(null);
	}

	function copyRoomId(){
		if(!roomId) return;
		try{ navigator.clipboard.writeText(roomId); } catch {}
	}

	function formatTimeShort(sec: number){
		const m = Math.floor(sec/60);
		const s = sec%60;
		return `${m}:${String(s).padStart(2,'0')}`;
	}

	const online = useMemo(() => ({
		socket,
		status,
		roomId: roomId ?? undefined,
		myColor: myColor ?? undefined,
	}), [socket, status, roomId, myColor]);

	return <div id="component">
		{joinEffectActive && (
			<div className="join-overlay">
				<div className="join-circle" style={{ left: joinEffectPos?.x, top: joinEffectPos?.y }} onAnimationEnd={()=> setJoinEffectActive(false)} />
			</div>
		)}
		<header className="app-header">
			<div className="brand" onClick={()=> window.location.href = '/'}>CHESSS</div>
			<button onClick={()=> setShowLogin(v => !v)}>{showLogin ? 'Close' : 'Login'}</button>
		</header>
		{showLogin ? (
			<div style={{ padding: 16 }}>
				<LoginComponent/>
			</div>
		) : (
			<div className="center-stage">
				<div id="online-controls">
					{/* create party button */}
					<button className="btn btn-primary" onClick={createPrivateRoom}>Create Party</button>
					{/* si es offline, mostrar el input y el boton de join party */}
					{status === 'offline' && (
						<>
							<input
								className="room-input"
								placeholder="Enter Party Code"
								value={joinCode}
								onChange={(e)=> setJoinCode(e.target.value)}
							/>
							<button className="btn btn-secondary" onClick={(e)=> handleJoinClick(e)} disabled={!joinCode.trim()}>Join Party</button>
						</>
					)}
					{/* si es waiting o playing, mostrar el estado y el boton de leave */}
					{(status === "waiting" || status === "playing") && (
						<span className="hint status-badge">
							{status === 'waiting' ? 'Waiting for opponent...' : 'Playing'} · Party: {roomId}
							{status === 'waiting' && <span> · Time: {formatTimeShort(selectedTime)}</span>}
							{status === 'playing' && activeTimeLimit !== null && <span> · Time: {formatTimeShort(activeTimeLimit)}</span>}
							<button className="copy-btn" onClick={copyRoomId} title="Copy">Copy</button>
						</span>
					)}
					{(status === "waiting" || status === "playing") && <button onClick={disconnect}>Leave</button>}
				</div>
				<div className="game-container">
					{/* time controls */}
					{(status === 'waiting' || status === 'offline') && (
						<div className="time-select">
							<button className={`btn ${selectedTime===180? 'btn-primary':''} time-btn`} onClick={()=> setSelectedTime(180)}>3:00</button>
							<button className={`btn ${selectedTime===300? 'btn-primary':''} time-btn`} onClick={()=> setSelectedTime(300)}>5:00</button>
							<button className={`btn ${selectedTime===600? 'btn-primary':''} time-btn`} onClick={()=> setSelectedTime(600)}>10:00</button>
						</div>
					)}
					<div className={`board-wrapper ${status !== 'playing' ? 'is-blurred' : ''}`}>
						<Chessboard  online={online} timeLimitSeconds={activeTimeLimit ?? undefined}/>
					</div>
				</div>
			</div>
		)}
	</div>
}

export default GameComps;