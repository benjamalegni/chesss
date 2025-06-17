import './Tile.css'
import { Piece } from '../../Constants'; // Import Piece type

interface Props{
    key:string; // key is a special prop, usually not defined in Props interface unless used explicitly
    isEven:boolean;
    piece?: Piece;
    highlight: boolean;
    // Removed onPieceMouseEnter and onPieceMouseLeave from Props
}

export default function Tile({isEven, piece, highlight}:Props){ // Removed onPieceMouseEnter, onPieceMouseLeave from params
    const className : string = ["tile", 
                                isEven ? "b_tile" : "w_tile",
                                highlight && "tile-highlight",
                            ].filter(Boolean).join(' ');

    return (
        <div className={className}>
            {piece &&
                <div
                    style={{ backgroundImage: `url(${piece.image})` }}
                    className="chess-piece"
                    // Removed onMouseEnter and onMouseLeave event handlers
                ></div>
            }
        </div>
    );
}