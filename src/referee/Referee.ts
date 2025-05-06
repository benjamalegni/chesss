import { PieceType, TeamType, Piece, Position, samePosition} from "../Constants";
import { GetPossiblePawnMoves,pawnMove } from "./rules/PawnRules";
import { knightMove } from "./rules/KnightRules";
import { bishopMove } from "./rules/BishopRules";
import { rookMove } from "./rules/RookRules";
import { kingMove } from "./rules/KingRules";

export default class Referee{
    static tileIsOccupied(position:Position, boardState: Piece[]):boolean{
        const piece = boardState.find((p) => samePosition(p.position,position));
        return piece?true:false;
    }

    static tileIsOccupiedByOpponent(position:Position, boardState:Piece[], team:TeamType):boolean{
        const piece = boardState.find((p)=>samePosition(p.position, position) && p.team!==team);
        return piece?true:false;
    }

    static isEnPassantMove(initialPosition: Position, desiredPosition:Position, type:PieceType, team:TeamType, boardState:Piece[]):boolean{
        const pawnDirection = (team === TeamType.OUR)? 1:-1;

        if(type===PieceType.PAWN){
            if(desiredPosition.y-initialPosition.y===pawnDirection && ((desiredPosition.x-initialPosition.x===-1) || (desiredPosition.x-initialPosition.x===1))){
                const piece = boardState.find((p)=> p.position.x===desiredPosition.x && (p.position.y===desiredPosition.y - pawnDirection && p.enPassant));

                return piece?true:false;
            }
        }
        return false;
    }

//pawn promotion




    isValidMove(initialPosition:Position, desiredPosition: Position, type:PieceType, team:TeamType, boardState:Piece[]){
        console.log(`referee checking.. piece: ${type}`);
        //movement
        const dx = desiredPosition.x - initialPosition.x; // difference in X axis
        const dy = desiredPosition.y - initialPosition.y; // difference in Y axis
        const stepX = dx > 0 ? 1 : -1; // direction of X axis: 1 or -1
        const stepY = dy > 0 ? 1 : -1; // direction of Y axis: 1 or -1

        switch(type){
            case PieceType.PAWN:{
            return pawnMove(initialPosition, desiredPosition, team, dx, dy, boardState);
            }
            case PieceType.KNIGHT:{
            return knightMove(initialPosition, desiredPosition, team, dx, dy, boardState);
            }
            case PieceType.BISHOP:{
            return bishopMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
            case PieceType.ROOK:{
            return rookMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
            case PieceType.QUEEN:{
            return (bishopMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState) || rookMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState));
            }
            case PieceType.KING:{
            return kingMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
        }

    }
 
    getValidMoves(piece:Piece, boardState:Piece[]) : Position[]{
        switch(piece.type){
            case PieceType.PAWN:
                return GetPossiblePawnMoves(piece,boardState);

            default:
                return [];
        }       


    }

}


