import './Chessboard.css';
import Tile from '../Tile/Tile'
import Referee from '../../referee/Referee'
import { useRef, useState } from 'react';
import { XAXIS, YAXIS, Piece, TeamType, PieceType, initialBoardState, Position, GRIDSIZE, samePosition } from '../../Constants';

export default function Chessboard(){
const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
const [grabPosition, setGrabPosition] = useState<Position>({x:-1, y:-1});
const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
const [hoveredPiece, setHoveredPiece] = useState<Piece | null>(null); // Added hoveredPiece state
const chessboardRef = useRef<HTMLDivElement>(null);
const referee = new Referee();
const [promotionPawn, setPromotionPawn] = useState<Piece>();
const modalRef = useRef<HTMLDivElement>(null);

function updateValidMoves(){
    setPieces((currentPieces) => {
        return currentPieces.map(p=>{
            p.possibleMoves = referee.getValidMoves(p, currentPieces);
            return p;

        });
    });
}

function showPreview(pieceData: Piece) {
    if (!pieceData) return;

    setPieces(currentPieces =>
        currentPieces.map(p => {
            if (samePosition(p.position, pieceData.position)) {
                return { ...p, possibleMoves: referee.getValidMoves(p, currentPieces) };
            }
            return p;
        })
    );
    setHoveredPiece(pieceData);
}

function clearPreview(){
    if(hoveredPiece){
        const pieceBeingDragged = activePiece ? pieces.find(p => samePosition(p.position, grabPosition)) : null;

        setPieces(currentPieces => {
            return currentPieces.map(p => {
                if (samePosition(p.position, hoveredPiece.position)) {
                    if (!pieceBeingDragged || !samePosition(p.position, pieceBeingDragged.position)) {
                        return { ...p, possibleMoves: [] };
                    }
                }
                return p;
            });
        });
        setHoveredPiece(null);
    }
}

function grabPiece(e: React.MouseEvent){
    updateValidMoves(); // This calculates moves for ALL pieces, which is good for overall validation.

    const chessboard = chessboardRef.current;
    const element = e.target as HTMLElement;

    if(element.classList.contains("chess-piece") && chessboard){
        const grabX = Math.floor((e.clientX - chessboard.offsetLeft)/GRIDSIZE)
        const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/GRIDSIZE))
        setGrabPosition({x:grabX, y:grabY})

        const x = e.clientX - GRIDSIZE/2;
        const y = e.clientY -GRIDSIZE/2;
        element.style.position="absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;



        setActivePiece(element);
    }
}

function movePiece(e: React.MouseEvent){
    const chessboard = chessboardRef.current;
    if(activePiece && chessboard){
        const x = e.clientX -50;
        const y = e.clientY -50;

        const minX = chessboard.offsetLeft -25;
        const minY = chessboard.offsetTop -25;
        const maxX = chessboard.offsetLeft + chessboard.clientWidth -75 ;
        const maxY = chessboard.offsetTop + chessboard.clientHeight -75;

        activePiece.style.position="absolute";


        // x axis limits
        if(x<minX){
            activePiece.style.left = `${minX}px`;
        } else if(x>maxX){
            activePiece.style.left = `${maxX}px`;
        } else{
            activePiece.style.left = `${x}px`;
        }

        // y axis limits
        if(y<minY){
            activePiece.style.top = `${minY}px`;
        } else if(y>maxY){
            activePiece.style.top = `${maxY}px`;
        } else{
            activePiece.style.top = `${y}px`;
        }
        
    }
}

function dropPiece(e: React.MouseEvent){
    const chessboard = chessboardRef.current;
    if(activePiece && chessboard){
        // substracted 800 to align with chessboard axis (starting from bottom left)
        const x=Math.floor((e.clientX - chessboard.offsetLeft)/GRIDSIZE);
        const y=Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/GRIDSIZE));

        const currentPiece = pieces.find(
            (p)=> samePosition(p.position, grabPosition));

        if(currentPiece){
            const validMove = referee.isValidMove(grabPosition, {x,y}, currentPiece.type,currentPiece.team, pieces);
            const isEnPassantMove = Referee.isEnPassantMove(grabPosition, {x,y},currentPiece.type,currentPiece.team, pieces)
            const pawnDirecion = currentPiece.team === TeamType.OUR?1:-1;

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
            }else{
                //reset piece position
                    activePiece.style.position= 'relative';
                    activePiece.style.removeProperty("top");
                    activePiece.style.removeProperty("left");

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
    }


    function promotionTeamType(){
        return (promotionPawn?.team === TeamType.OUR)?"w":"b";
    }

    let board = [];

    for(let y= YAXIS.length-1;y>=0;y--){
        for(let x=0;x<XAXIS.length;x++){

            // check whether the sum of numbers x,y is even to draw each tile
            const isEven = (x+y+2)%2===0;

            const pieceOnSquare = pieces.find(p => samePosition(p.position, {x, y}));

            let highlight = false;
            // Determine which piece's moves to show: active (dragged) or hovered (if no piece is dragged)
            const pieceWhoseMovesToShow = activePiece
                ? pieces.find(p => samePosition(p.position, grabPosition))
                : hoveredPiece;

            if (pieceWhoseMovesToShow?.possibleMoves) {
                highlight = pieceWhoseMovesToShow.possibleMoves.some(m => samePosition(m, { x, y }));
            }
            
            board.push(
                <Tile
                    key={`${x},${y}`}
                    isEven={isEven}
                    piece={pieceOnSquare}
                    highlight={highlight}
                    onPieceMouseEnter={() => pieceOnSquare && showPreview(pieceOnSquare)}
                    onPieceMouseLeave={() => pieceOnSquare && clearPreview()}
                />
            )
        }
    }       


    return(
        <>
        <div id="pawn-promotion-modal" className="hidden" ref={modalRef}>
            <div className="modal-body">

            <img onClick={()=> promotePawn(PieceType.ROOK)} src={`${process.env.PUBLIC_URL}/assets/images/rook_${promotionTeamType()}.svg`}/>
            <img onClick={()=> promotePawn(PieceType.BISHOP)} src={`${process.env.PUBLIC_URL}/assets/images/bishop_${promotionTeamType()}.svg`}/>
            <img onClick={()=> promotePawn(PieceType.KNIGHT)} src={`${process.env.PUBLIC_URL}/assets/images/knight_${promotionTeamType()}.svg`}/>
            <img onClick={()=> promotePawn(PieceType.QUEEN)} src={`${process.env.PUBLIC_URL}/assets/images/queen_${promotionTeamType()}.svg`}/>
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