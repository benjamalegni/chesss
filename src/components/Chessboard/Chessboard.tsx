import './Chessboard.css';
import Tile from '../Tile/Tile'
import Referee from '../../referee/Referee'
import { useEffect, useRef, useState } from 'react';
import { XAXIS, YAXIS, Piece, TeamType, PieceType, initialBoardState, Position, GRIDSIZE, samePosition } from '../../Constants';
import type { Socket } from 'socket.io-client';

interface OnlineProps{
	socket: Socket | null;
	status: 'offline' | 'waiting' | 'playing';
	roomId?: string;
	myColor?: 'white' | 'black';
}

export default function Chessboard({ online, timeLimitSeconds }: { online?: OnlineProps, timeLimitSeconds?: number }){
const [activePiece, setActivePiece] = useState<HTMLElement | null>(null)
const [grabPosition, setGrabPosition] = useState<Position>({x:-1, y:-1});
const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
const chessboardRef = useRef<HTMLDivElement>(null);
const referee = new Referee();
const [promotionPawn, setPromotionPawn] = useState<Piece>();
const modalRef = useRef<HTMLDivElement>(null);
const [currentTurn, setCurrentTurn] = useState<'white'|'black'>('white');
const [lastMove, setLastMove] = useState<{from: Position, to: Position} | null>(null);
const [awaitingPromotion, setAwaitingPromotion] = useState<boolean>(false);

// Clock state
const [whiteTimeLeft, setWhiteTimeLeft] = useState<number | null>(null);
const [blackTimeLeft, setBlackTimeLeft] = useState<number | null>(null);
const [clockStarted, setClockStarted] = useState<boolean>(false);

// Responsive tile size in px, derived from board size
const [tileSize, setTileSize] = useState<number>(GRIDSIZE);
useEffect(()=>{
	function updateTileSize(){
		const el = chessboardRef.current;
		if(!el) return;
		const rect = el.getBoundingClientRect();
		const size = Math.floor(rect.width / 8);
		if(size > 0) setTileSize(size);
	}
	updateTileSize();
	window.addEventListener('resize', updateTileSize);
	return ()=> window.removeEventListener('resize', updateTileSize);
}, []);

function getAllowedTeamForMe(): TeamType | null{
	if(!online || online.status !== 'playing' || !online.myColor){
		return null;
	}
	return online.myColor === 'white' ? TeamType.OUR : TeamType.OPPONENT;
}

function isMyTurn(): boolean{
	if(!online || online.status !== 'playing' || !online.myColor){
		return true; // offline mode: always allowed
	}
	return online.myColor === currentTurn;
}

// Initialize turn and timers when a game starts or time limit provided
useEffect(()=>{
	if(online?.status === 'playing'){
		setCurrentTurn('white');
		if(whiteTimeLeft === null || blackTimeLeft === null){
			const limit = (typeof timeLimitSeconds === 'number' && timeLimitSeconds > 0) ? timeLimitSeconds : 300;
			setWhiteTimeLeft(limit);
			setBlackTimeLeft(limit);
		}
		setClockStarted(true);
	} else {
		setClockStarted(false);
	}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [online?.status, timeLimitSeconds]);

// Opponent move listener
useEffect(()=>{
	const s = online?.socket;
	if(!s) return;
	const onMove = (msg: any) => {
		try{
			setClockStarted(true);
			if(msg.type === 'move'){
				// compatibility if server sends type wrapper
			}
			const from: Position = msg.from;
			const to: Position = msg.to;
			const promotion: PieceType | undefined = msg.promotionType;
			setPieces((currentPieces)=>{
				let updated = currentPieces;
				const movingPiece = updated.find(p=> samePosition(p.position, from));
				if(!movingPiece){
					return updated;
				}
				const isEnPassantMove = Referee.isEnPassantMove(from, to, movingPiece.type, movingPiece.team, updated);
				const pawnDirecion = movingPiece.team === TeamType.OUR?1:-1;
				if(isEnPassantMove){
					updated = updated.reduce((results, piece)=>{
						if(samePosition(piece.position, from)){
							piece.enPassant=false;
							piece.position.x=to.x;
							piece.position.y=to.y;
							results.push(piece);
						}else if(!samePosition(piece.position, {x: to.x, y: to.y - pawnDirecion})){
							if(piece.type===PieceType.PAWN){
								piece.enPassant=false;
							}
							results.push(piece);
						}
						return results;
					}, [] as Piece[]);
				} else {
					updated = updated.reduce((results, piece)=>{
						if(samePosition(piece.position, from)){
							piece.enPassant = Math.abs(from.y - to.y)===2 && (piece.type===PieceType.PAWN);
							piece.position.x = to.x;
							piece.position.y = to.y;
							results.push(piece);
						} else if(!samePosition(piece.position, to)){
							if(piece.type===PieceType.PAWN){
								piece.enPassant=false;
							}
							results.push(piece);
						}
						return results;
					}, [] as Piece[]);
				}
				if(promotion !== undefined){
					const promoted = updated.find(p=> samePosition(p.position, to));
					if(promoted){
						promoted.type = promotion;
						const teamType = (promoted.team === TeamType.OUR)?"w":"b";
						let image = "";
						switch(promotion){
							case PieceType.ROOK: image = "rook"; break;
							case PieceType.BISHOP: image = "bishop"; break;
							case PieceType.KNIGHT: image = "knight"; break;
							case PieceType.QUEEN: image = "queen"; break;
						}
						if(image){
							promoted.image = `${process.env.PUBLIC_URL}/assets/images/${image}_${teamType}.svg`;
						}
					}
				}
				return updated;
			});
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		}catch(_e){
			// ignore
		}
	};
	s.on('move', onMove);
	return () => {
		s.off('move', onMove);
	};
}, [online]);

function updateValidMoves(){
	setPieces((currentPieces) => {
		return currentPieces.map(p=>{
			p.possibleMoves = referee.getValidMoves(p, currentPieces);
			return p;

		});
	});
}

// Clock ticking effect
useEffect(()=>{
	if(whiteTimeLeft === null || blackTimeLeft === null) return;
	if(!online || online.status !== 'playing') return;
	if(awaitingPromotion) return;
	if(!clockStarted) return;
	const interval = setInterval(()=>{
		if(currentTurn === 'white'){
			setWhiteTimeLeft(prev => {
				if(prev === null) return prev;
				const next = Math.max(0, prev - 1);
				return next;
			});
		} else {
			setBlackTimeLeft(prev => {
				if(prev === null) return prev;
				const next = Math.max(0, prev - 1);
				return next;
			});
		}
	}, 1000);
	return () => clearInterval(interval);
}, [online, online?.status, currentTurn, whiteTimeLeft, blackTimeLeft, awaitingPromotion, clockStarted]);

// Ensure the clock starts after the very first move (local or remote)
useEffect(()=>{
	if(lastMove && typeof timeLimitSeconds === 'number' && timeLimitSeconds > 0){
		setClockStarted(true);
	}
}, [lastMove, timeLimitSeconds]);

function performMove(target: Position){
	const currentPiece = pieces.find((p)=> samePosition(p.position, grabPosition));
	if(!currentPiece) return;
	const { x, y } = target;
	const validMove = referee.isValidMove(grabPosition, {x,y}, currentPiece.type,currentPiece.team, pieces);
	const isEnPassantMove = Referee.isEnPassantMove(grabPosition, {x,y},currentPiece.type,currentPiece.team, pieces)
	const pawnDirecion = currentPiece.team === TeamType.OUR?1:-1;

	if(online && online.status === 'playing'){
		const myTeam = getAllowedTeamForMe();
		if(!isMyTurn() || myTeam === null || currentPiece.team !== myTeam){
			return;
		}
		// Optional: stop moves if your time is up
		if(typeof timeLimitSeconds === 'number' && timeLimitSeconds > 0){
			if((currentTurn === 'white' && whiteTimeLeft === 0) || (currentTurn === 'black' && blackTimeLeft === 0)){
				return;
			}
		}
	}

	if(isEnPassantMove){
		const updatedPieces = pieces.reduce((results, piece)=>{
			if(samePosition(piece.position, grabPosition)){
				piece.enPassant=false;
				piece.position.x=x;
				piece.position.y=y;
				results.push(piece);
			}else if(!samePosition(piece.position, {x, y: y-pawnDirecion})){
				if(piece.type===PieceType.PAWN){
					piece.enPassant=false;
				}
				results.push(piece);
			}
			return results;
		}, [] as Piece[])
		setPieces(updatedPieces);
		setLastMove({from: grabPosition, to: {x, y}});
		setClockStarted(true);
		if(!online || online.status !== 'playing'){
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		} else {
			online.socket?.emit('move', { roomId: online.roomId, from: grabPosition, to: {x, y} });
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		}
	}else if(validMove){
		const updatedPieces = pieces.reduce((results,piece)=>{
			if(samePosition(piece.position, grabPosition)){
				piece.enPassant = Math.abs(grabPosition.y-y)===2 &&(piece.type===PieceType.PAWN)
				piece.position.x=x;
				piece.position.y=y;
				let promotionRow = piece.team === TeamType.OUR ? 7:0;
				if(y===promotionRow && piece.type === PieceType.PAWN){
					modalRef.current?.classList.remove("hidden")
					setPromotionPawn(piece);
					setAwaitingPromotion(true);
				}
				results.push(piece);
			}else if(!(samePosition(piece.position, {x,y}))){
				if(piece.type===PieceType.PAWN){
					piece.enPassant=false;
				}
				results.push(piece);
			}
			return results;
		}, [] as Piece[])
		setPieces(updatedPieces);
		setLastMove({from: grabPosition, to: {x, y}});
		if(!(awaitingPromotion)){
			setClockStarted(true);
			if(!online || online.status !== 'playing'){
				setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
			} else {
				online.socket?.emit('move', { roomId: online.roomId, from: grabPosition, to: {x, y} });
				setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
			}
		}
	}
}

function pickTileFromCursor(clientX: number, clientY: number){
	const chessboard = chessboardRef.current;
	if(!chessboard) return { x: -1, y: -1 };
	const rect = chessboard.getBoundingClientRect();
	const relX = clientX - rect.left;
	const relY = clientY - rect.top;
	const x = Math.floor(relX / tileSize);
	const y = Math.abs(Math.ceil((relY - rect.height)/tileSize)); // invert axis
	return { x, y };
}

function grabPiece(e: React.MouseEvent){
	updateValidMoves();

	const chessboard = chessboardRef.current;
	const element = e.target as HTMLElement;

	if(element.classList.contains("chess-piece") && chessboard){
		const { x: grabX, y: grabY } = pickTileFromCursor(e.clientX, e.clientY);
		const pieceAtTile = pieces.find(p => samePosition(p.position, {x: grabX, y: grabY}));

		// Online restrictions
		if(online && online.status === 'playing'){
			const myTeam = getAllowedTeamForMe();
			if(!isMyTurn() || myTeam === null || !pieceAtTile || pieceAtTile.team !== myTeam){
				return; // can't grab
			}
		}

		setGrabPosition({x:grabX, y:grabY})

		const x = e.clientX - tileSize/2;
		const y = e.clientY - tileSize/2;
		element.style.position = 'fixed';
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
		element.style.zIndex = '1000';
		// Lock the dragged image size to match the tile to avoid zoom/stretch
		const dragSize = Math.round(tileSize * 0.85);
		element.style.width = `${dragSize}px`;
		element.style.height = `${dragSize}px`;

		setActivePiece(element);
	}
}

function movePiece(e: React.MouseEvent){
	const chessboard = chessboardRef.current;
	if(activePiece && chessboard){
		const x = e.clientX - tileSize/2;
		const y = e.clientY - tileSize/2;

		const rect = chessboard.getBoundingClientRect();
		const minX = rect.left;
		const minY = rect.top;
		const maxX = rect.right - tileSize;
		const maxY = rect.bottom - tileSize;

		activePiece.style.position = 'fixed';

		// x axis limits
		if(x < minX){
			activePiece.style.left = `${minX}px`;
		} else if(x > maxX){
			activePiece.style.left = `${maxX}px`;
		} else{
			activePiece.style.left = `${x}px`;
		}

		// y axis limits
		if(y < minY){
			activePiece.style.top = `${minY}px`;
		} else if(y > maxY){
			activePiece.style.top = `${maxY}px`;
		} else{
			activePiece.style.top = `${y}px`;
		}
		
	}
}

function dropPiece(e: React.MouseEvent){
	const chessboard = chessboardRef.current;
	if(activePiece && chessboard){
		const target = pickTileFromCursor(e.clientX, e.clientY);
		performMove(target);
		//reset piece position
		activePiece.style.position= 'relative';
		activePiece.style.removeProperty("top");
		activePiece.style.removeProperty("left");
		activePiece.style.removeProperty("z-index");
		activePiece.style.removeProperty("width");
		activePiece.style.removeProperty("height");
		setActivePiece(null);
	}
}

	function promotePawn(pieceType: PieceType){
		if(promotionPawn===undefined){
			return;
		}
		const updatedPieces = pieces.reduce((results, piece) =>{

			if(samePosition(piece.position, promotionPawn?.position)){
				piece.type = pieceType;
				const teamType = (piece.team === TeamType.OUR)?"w":"b";
				let image = "";
				switch(pieceType){
					case PieceType.ROOK:{
						image = "rook";
						break;
					}

					case PieceType.BISHOP:{
						image = "bishop";
						break;
					}

					case PieceType.KNIGHT:{
						image = "knight";
						break;
					}

					case PieceType.QUEEN:{
						image = "queen";
						break;
					}
				}
				piece.image = `${process.env.PUBLIC_URL}/assets/images/${image}_${teamType}.svg`;
			}

			results.push(piece);
			return results;
		}, [] as Piece[])
		setPieces(updatedPieces);
		modalRef.current?.classList.add("hidden");
		setAwaitingPromotion(false);
		if(online && online.status === 'playing' && lastMove){
			online.socket?.emit('move', {
				roomId: online.roomId,
				from: lastMove.from,
				to: lastMove.to,
				promotionType: pieceType
			});
			setClockStarted(true);
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		} else if(!online || online.status !== 'playing'){
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		}
	}


	function promotionTeamType(){
		return (promotionPawn?.team === TeamType.OUR)?"w":"b";
	}

	function formatTime(totalSeconds: number | null){
		if(totalSeconds === null) return '--:--';
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		return `${m}:${s.toString().padStart(2,'0')}`;
	}

	let board = [];

	for(let y= YAXIS.length-1;y>=0;y--){
		for(let x=0;x<XAXIS.length;x++){

			// check whether the sum of numbers x,y is even to draw each tile
			const isEven = (x+y+2)%2===0;
			let img = undefined;

			pieces.forEach(p=> {
				if(samePosition(p.position, {x:x, y:y})){
					img=p.image
				}
			})

			let currentPiece = pieces.find(p=> samePosition(p.position,grabPosition));
			let highlight = (currentPiece?.possibleMoves) ? currentPiece.possibleMoves.some(p=> samePosition(p, {x:x , y:y})): false;
			const targetHasPiece = pieces.some(p => samePosition(p.position, {x, y}));
			const capture = highlight && targetHasPiece;
			const handleClick = highlight ? () => performMove({ x, y }) : undefined;
			
			board.push(
					<Tile key={`${x},${y}`} isEven={isEven} image={img} highlight={highlight} capture={capture} onClick={handleClick}/> 
			)
		}
	}


	return(
		<>
		<div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
			<div className="modal-body">

			<img onClick={()=> promotePawn(PieceType.ROOK)} src={`${process.env.PUBLIC_URL}/assets/images/rook_${promotionTeamType()}.svg`} alt="promote rook"/>
			<img onClick={()=> promotePawn(PieceType.BISHOP)} src={`${process.env.PUBLIC_URL}/assets/images/bishop_${promotionTeamType()}.svg`} alt="promote bishop"/>
			<img onClick={()=> promotePawn(PieceType.KNIGHT)} src={`${process.env.PUBLIC_URL}/assets/images/knight_${promotionTeamType()}.svg`} alt="promote knight"/>
			<img onClick={()=> promotePawn(PieceType.QUEEN)} src={`${process.env.PUBLIC_URL}/assets/images/queen_${promotionTeamType()}.svg`} alt="promote queen"/>
			</div>
		</div>

		<div className="board-layout">

			{/* timer panel */}
			{(online?.status === 'playing') && (
			<div className="timer-panel">
				<div className={`timer-block ${currentTurn==='black' ? 'active' : ''}`}>
					<div className="timer-label">Black</div>
					<div className="timer-value">{formatTime(blackTimeLeft)}</div>
				</div>
				<div className={`timer-block ${currentTurn==='white' ? 'active' : ''}`}>
					<div className="timer-label">White</div>
					<div className="timer-value">{formatTime(whiteTimeLeft)}</div>
				</div>
			</div>
			)}


			<div 
				onMouseMove={(e)=>movePiece(e)} 
				onMouseDown={e=> grabPiece(e)} 
				onMouseUp={(e)=> dropPiece(e)}
				id="chessboard"
				ref={chessboardRef}>
					{board}
			</div>
		</div>
		</>
	)
}