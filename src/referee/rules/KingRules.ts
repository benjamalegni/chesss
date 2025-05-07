import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

export const kingMove=(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean=>{
            //one tile movement
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1){
                return (!Referee.tileIsOccupied(desiredPosition, boardState) || Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team));
            }
        return false;
}

export const GetPossibleKingMoves = (piece:Piece, boardState:Piece[]):Position[]=>{
    const possibleMoves:Position[] = [];
 
    for(let y=-1;y<=1;y++){
        for(let x=-1;x<=1;x++){
            if(x===0 && y===0){
                continue;
            }
            const desiredPosition:Position = {
                x:piece.position.x + x,
                y:piece.position.y + y
            }

            if(kingMove(piece.position, desiredPosition, piece.team, x, y, 0, 0, boardState)){
                possibleMoves.push(desiredPosition);
            }
        }
    }
    return possibleMoves;
}