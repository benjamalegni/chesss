import './Chessboard.css';
import Tile from '../Tile/Tile'

const N = 8;
const xAxis = ["a","b","c","d","e","f","g","h"];
const yAxis = ["1","2","3","4","5","6","7","8"];

interface Piece{
    image: string
    x: number
    y: number
}

const pieces:Piece[] = []
for(let i=0;i<8;i++){
    pieces.push({image:"assets/images/pawn_b.png",x:i , y:6})
}


// white pieces
for(let i=0;i<8;i++){
    pieces.push({image:"assets/images/pawn_w.png",x:i , y:1})
}

for(let p=0;p<2;p++){
    const y = (p === 0)?7:0; 
    const color = (y===7)?"b":"w";

    pieces.push({image:`assets/images/rook_${color}.png`,x:0 , y:y})
    pieces.push({image:`assets/images/knight_${color}.png`,x:1 , y:y})
    pieces.push({image:`assets/images/bishop_${color}.png`,x:2 , y:y})
    pieces.push({image:`assets/images/queen_${color}.png`,x:3 , y:y})
    pieces.push({image:`assets/images/king_${color}.png`,x:4 , y:y})
    pieces.push({image:`assets/images/bishop_${color}.png`,x:5 , y:y})
    pieces.push({image:`assets/images/knight_${color}.png`,x:6 , y:y})
    pieces.push({image:`assets/images/rook_${color}.png`,x:7 , y:y})
}

let activePiece: HTMLElement | null = null;

function grabPiece(e: React.MouseEvent){
    const element = e.target as HTMLElement;

    if(element.classList.contains("chess-piece")){

        console.log(e);
        const x = e.clientX -50;
        const y = e.clientY -50;
        element.style.position="absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        activePiece = element;
    }
}

function movePiece(e: React.MouseEvent){
    if(activePiece){
        const x = e.clientX -50;
        const y = e.clientY -50;
        activePiece.style.position="absolute";
        activePiece.style.left = `${x}px`;
        activePiece.style.top = `${y}px`;
    }
}

function dropPiece(e: React.MouseEvent){
    if(activePiece){
        activePiece = null;
    }
}


export default function Chessboard(){
    let board = [];

    for(let y=N-1;y>=0;y--){
        for(let x=0;x<N;x++){

            // check whether the sum of numbers x,y is even to draw each tile
            const isEven = (x+y+2)%2===0;
            const hasMarker = (y===0)||(x===0);
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
        id="chessboard">{board}
    </div>
}