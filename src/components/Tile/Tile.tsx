import './Tile.css'
import { Piece } from '../../Constants'; // Import Piece type

interface Props{
    key:string; // key is a special prop, usually not defined in Props interface unless used explicitly
    isEven:boolean;
    piece?: Piece; // Changed from image?: string
    highlight: boolean;
    onPieceMouseEnter: (piece: Piece) => void; // Callback for mouse enter
    onPieceMouseLeave: () => void;      // Callback for mouse leave
}

export default function Tile({isEven, piece, highlight, onPieceMouseEnter, onPieceMouseLeave}:Props){
    const className : string = ["tile", 
                                isEven ? "b_tile" : "w_tile",
                                highlight && "tile-highlight",
                                // image && "chess-piece" // Removed: chess-piece class is on the inner div
                            ].filter(Boolean).join(' ');

    return (
        <div className={className}>
            {piece &&
                <div
                    style={{ backgroundImage: `url(${piece.image})` }}
                    className="chess-piece"
                    onMouseEnter={() => onPieceMouseEnter(piece)}
                    onMouseLeave={onPieceMouseLeave}
                ></div>
            }
        </div>
    );
}