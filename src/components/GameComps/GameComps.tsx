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
            setStatus("playing");
        });
        s.on('opponent_left', () => {
            setStatus("offline");
            setRoomId(null);
            setMyColor(null);
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
        });
        setSocket(s);
        return s;
    }

    function createPrivateRoom(){
        const s = ensureSocket();
        s.emit('create_room');
    }

    function joinPrivateRoom(){
        const code = joinCode.trim();
        if(!code) return;
        const s = ensureSocket();
        s.emit('join_room', { roomId: code });
    }

    function disconnect(){
        try{ socket?.close(); } catch {}
        setStatus("offline");
        setRoomId(null);
        setMyColor(null);
        setSocket(null);
    }

    function copyRoomId(){
        if(!roomId) return;
        try{ navigator.clipboard.writeText(roomId); } catch {}
    }

    const online = useMemo(() => ({
        socket,
        status,
        roomId: roomId ?? undefined,
        myColor: myColor ?? undefined,
    }), [socket, status, roomId, myColor]);

    return <div id="component">
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <button onClick={()=> setShowLogin(v => !v)}>{showLogin ? 'Cerrar' : 'Login'}</button>
        </div>
        {showLogin ? (
            <div style={{ padding: 16 }}>
                <LoginComponent/>
            </div>
        ) : (
            <div className="center-stage">
                <div id="online-controls">
                    <button className="btn btn-primary" onClick={createPrivateRoom} disabled={status === "waiting" || status === "playing"}>Crear sala</button>
                    <input
                        className="room-input"
                        placeholder="Ingresar código de sala"
                        value={joinCode}
                        onChange={(e)=> setJoinCode(e.target.value)}
                        disabled={status === "waiting" || status === "playing"}
                    />
                    <button className="btn btn-secondary" onClick={joinPrivateRoom} disabled={status === "waiting" || status === "playing" || !joinCode.trim()}>Unirse a sala</button>
                    {(status === "waiting" || status === "playing") && (
                        <span className="hint status-badge">
                            {status === 'waiting' ? 'Esperando oponente…' : 'En juego'} · Sala: {roomId}
                            <button className="copy-btn" onClick={copyRoomId} title="Copiar código">Copiar</button>
                        </span>
                    )}
                    {(status === "waiting" || status === "playing") && <button onClick={disconnect}>Salir</button>}
                </div>
                <div className={`board-wrapper ${status !== 'playing' ? 'is-blurred' : ''}`}>
                    <Chessboard online={online}/>
                </div>
            </div>
        )}
    </div>
}

export default GameComps;