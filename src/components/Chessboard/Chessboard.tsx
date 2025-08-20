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

export default function Chessboard({ online }: { online?: OnlineProps }){
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

useEffect(()=>{
	if(online && online.status === 'playing'){
		setCurrentTurn('white');
	}
}, [online]);

useEffect(()=>{
	const s = online?.socket;
	if(!s) return;
	const onMove = (msg: any) => {
		try{
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
}, [online?.socket, online?.roomId]);

function updateValidMoves(){
	setPieces((currentPieces) => {
		return currentPieces.map(p=>{
			p.possibleMoves = referee.getValidMoves(p, currentPieces);
			return p;

		});
	});
}

function pickTileFromCursor(clientX: number, clientY: number){
	const chessboard = chessboardRef.current;
	if(!chessboard) return { x: -1, y: -1 };
	const rect = chessboard.getBoundingClientRect();
	const relX = clientX - rect.left;
	const relY = clientY - rect.top;
	const x = Math.floor(relX / GRIDSIZE);
	const y = Math.abs(Math.ceil((relY - rect.height)/GRIDSIZE)); // invert axis
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

		const x = e.clientX - GRIDSIZE/2;
		const y = e.clientY - GRIDSIZE/2;
		element.style.position = 'fixed';
		element.style.left = `${x}px`;
		element.style.top = `${y}px`;
		element.style.zIndex = '1000';

		setActivePiece(element);
	}
}

function movePiece(e: React.MouseEvent){
	const chessboard = chessboardRef.current;
	if(activePiece && chessboard){
		const x = e.clientX - GRIDSIZE/2;
		const y = e.clientY - GRIDSIZE/2;

		const rect = chessboard.getBoundingClientRect();
		const minX = rect.left;
		const minY = rect.top;
		const maxX = rect.right - GRIDSIZE;
		const maxY = rect.bottom - GRIDSIZE;

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
		const { x, y } = pickTileFromCursor(e.clientX, e.clientY);

		const currentPiece = pieces.find(
			(p)=> samePosition(p.position, grabPosition));

		if(currentPiece){
			const validMove = referee.isValidMove(grabPosition, {x,y}, currentPiece.type,currentPiece.team, pieces);
			const isEnPassantMove = Referee.isEnPassantMove(grabPosition, {x,y},currentPiece.type,currentPiece.team, pieces)
			const pawnDirecion = currentPiece.team === TeamType.OUR?1:-1;

			if(online && online.status === 'playing'){
				const myTeam = getAllowedTeamForMe();
				if(!isMyTurn() || myTeam === null || currentPiece.team !== myTeam){
					// Reset piece position and bail
					activePiece.style.position= 'relative';
					activePiece.style.removeProperty("top");
					activePiece.style.removeProperty("left");
					activePiece.style.removeProperty("z-index");
					setActivePiece(null);
					return;
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
				if(!online || online.status !== 'playing'){
					// offline toggle turn for consistency
					setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
				} else {
					// send immediately (no promotion possible on en passant)
					online.socket?.emit('move', {
						roomId: online.roomId,
						from: grabPosition,
						to: {x, y}
					});
					setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
				}
			}else if(validMove){
				const updatedPieces = pieces.reduce((results,piece)=>{
					if(samePosition(piece.position, grabPosition)){
						// SPECIAL MOVE
						piece.enPassant = Math.abs(grabPosition.y-y)===2 &&(piece.type===PieceType.PAWN)
						piece.position.x=x;
						piece.position.y=y;

						// pawn promotion row
						let promotionRow = piece.team === TeamType.OUR ? 7:0;
						if(y===promotionRow && piece.type === PieceType.PAWN){
							//make promotion
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
					if(!online || online.status !== 'playing'){
						setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
					} else {
						// no promotion: send immediately
						online.socket?.emit('move', {
							roomId: online.roomId,
							from: grabPosition,
							to: {x, y}
						});
						setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
					}
				}
			}else{
				//reset piece position
					activePiece.style.position= 'relative';
					activePiece.style.removeProperty("top");
					activePiece.style.removeProperty("left");
					activePiece.style.removeProperty("z-index");

			}
		}

		
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
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		} else if(!online || online.status !== 'playing'){
			setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
		}
	}


	function promotionTeamType(){
		return (promotionPawn?.team === TeamType.OUR)?"w":"b";
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
			
			board.push(
					<Tile key={`${x},${y}`} isEven={isEven} image={img} highlight={highlight} capture={capture}/> 
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

		<div 
			onMouseMove={(e)=>movePiece(e)} 
			onMouseDown={e=> grabPiece(e)} 
			onMouseUp={(e)=> dropPiece(e)}
			id="chessboard"
			ref={chessboardRef}>
				{board}
		</div>
		</>
	)
}