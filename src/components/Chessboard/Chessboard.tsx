import './Chessboard.css';
import Tile from '../Tile/Tile'
import Referee from '../../referee/Referee'
import { useRef, useState } from 'react';

const N = 8;
const xAxis = ["a","b","c","d","e","f","g","h"];
const yAxis = ["1","2","3","4","5","6","7","8"];

export interface Piece{
    image: string
    x: number
    y: number
    type: PieceType
    team: TeamType
    enPassant?:boolean
}


export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export enum TeamType{
    OPPONENT,
    OUR 
}

const initialBoardState: Piece[] = []

// black pawns
for(let i=0;i<8;i++){
    initialBoardState.push({image:"assets/images/pawn_b.png",x:i , y:6, type: PieceType.PAWN, team: TeamType.OPPONENT})
}

// white pawns
for(let i=0;i<8;i++){
    initialBoardState.push({image:"assets/images/pawn_w.png",x:i , y:1, type: PieceType.PAWN, team: TeamType.OUR})
}


// rest of the pieces
for(let p=0;p<2;p++){

    const teamType = (p===0)?TeamType.OPPONENT: TeamType.OUR;
    const y = (p === 0)?7:0; 
    const color = (teamType===TeamType.OPPONENT)?"b":"w";

    initialBoardState.push({image:`assets/images/rook_${color}.png`,x:0 , y:y, type: PieceType.ROOK, team: teamType})
    initialBoardState.push({image:`assets/images/knight_${color}.png`,x:1 , y:y, type: PieceType.KNIGHT, team: teamType})
    initialBoardState.push({image:`assets/images/bishop_${color}.png`,x:2 , y:y, type: PieceType.BISHOP,team: teamType})
    initialBoardState.push({image:`assets/images/queen_${color}.png`,x:3 , y:y, type: PieceType.QUEEN,team: teamType})
    initialBoardState.push({image:`assets/images/king_${color}.png`,x:4 , y:y, type: PieceType.KING,team: teamType})
    initialBoardState.push({image:`assets/images/bishop_${color}.png`,x:5 , y:y, type: PieceType.BISHOP,team: teamType})
    initialBoardState.push({image:`assets/images/knight_${color}.png`,x:6 , y:y, type: PieceType.KNIGHT, team: teamType})
    initialBoardState.push({image:`assets/images/rook_${color}.png`,x:7 , y:y, type: PieceType.ROOK, team: teamType})
}


export default function Chessboard(){
const [activePiece, setActivePiece] = useState<HTMLElement | null>(null)
const [xAxis,setXAxis] = useState(0);
const [yAxis,setYAxis] = useState(0);
const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
const chessboardRef = useRef<HTMLDivElement>(null);
const referee = new Referee();

function grabPiece(e: React.MouseEvent){
    const chessboard = chessboardRef.current;
    const element = e.target as HTMLElement;

    if(element.classList.contains("chess-piece") && chessboard){
        setXAxis(Math.floor((e.clientX - chessboard.offsetLeft)/100));
        setYAxis(Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/100)));


        const x = e.clientX -50;
        const y = e.clientY -50;
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
        const x=Math.floor((e.clientX - chessboard.offsetLeft)/100);
        const y=Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/100));

        const currentPiece = pieces.find((p)=> p.x===xAxis && p.y===yAxis);
        const attackedPiece = pieces.find((p)=> p.x===x && p.y===y);       
        if(currentPiece){
            const validMove = referee.isValidMove(xAxis,yAxis,x,y,currentPiece.type,currentPiece.team, pieces);
            const isEnPassantMove = referee.isEnPassantMove(xAxis,yAxis,x,y,currentPiece.type,currentPiece.team, pieces)
            const pawnDirecion = currentPiece.team === TeamType.OUR?1:-1;

            if(isEnPassantMove){
                const updatedPieces = pieces.reduce((results, piece)=>{
                    if(piece.x===xAxis && piece.y===yAxis){
                        piece.enPassant=false;
                        piece.x=x;
                        piece.y=y;
                        results.push(piece);
                    }else if(!(piece.x===x && piece.y===y - pawnDirecion)){
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
                    if(piece.x===xAxis && piece.y===yAxis){
                        if(Math.abs(yAxis-y)===2 &&(piece.type===PieceType.PAWN)){
                            piece.enPassant=true;
                        }
                        piece.x=x;
                        piece.y=y;
                        results.push(piece);
                    }else if(!(piece.x===x && piece.y===y)){
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



    let board = [];

    for(let y=N-1;y>=0;y--){
        for(let x=0;x<N;x++){

            // check whether the sum of numbers x,y is even to draw each tile
            const isEven = (x+y+2)%2===0;
            let img = undefined;

            pieces.forEach(p=> {
                if(p.x===x && p.y===y){
                    img=p.image
                }
            })

            
            board.push(
                    <Tile key={`${x},${y}`} isEven={isEven} image={img}/> 
            )
        }
        }       


    return <div 
        onMouseMove={(e)=>movePiece(e)} 
        onMouseDown={e=> grabPiece(e)} 
        onMouseUp={(e)=> dropPiece(e)}
        id="chessboard"
        ref={chessboardRef}>
            {board}
    </div>
}