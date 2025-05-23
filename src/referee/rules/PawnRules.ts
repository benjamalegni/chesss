import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"


    export const pawnMove=(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, boardState:Piece[]):boolean=>{
            const specialRow = (team === TeamType.OUR)?1:6;
            const pawnDirection = (team === TeamType.OUR)? 1:-1;

            if(initialPosition.x===desiredPosition.x && initialPosition.y===specialRow && dy===2*pawnDirection){
                if(!Referee.tileIsOccupied(desiredPosition,boardState) && !Referee.tileIsOccupied({x: desiredPosition.x, y:desiredPosition.y-pawnDirection}, boardState)){
                    return true;
                }
            }else if(initialPosition.x===desiredPosition.x && dy===pawnDirection){
                    return !Referee.tileIsOccupied(desiredPosition,boardState)
            }
            //attack
            else if(dy===pawnDirection && ((dx===-1) || (dx===1))){
                return Referee.tileIsOccupiedByOpponent(desiredPosition,boardState,team);
            }
        return false;
    }

export const GetPossiblePawnMoves = (piece:Piece, boardState : Piece[]):Position[] => {
    const possibleMoves:Position [] = [];
    const pawnDirection = (piece.team === TeamType.OUR)? 1:-1;

    // Check all possible moves in a 3x2 grid in front of the pawn
    for(let y = 1; y < 3; y++) {
        for(let x = -1; x <= 1; x++) {
            const desiredPosition = {x:piece.position.x + x, y:piece.position.y + y*pawnDirection};
            if(pawnMove(piece.position,desiredPosition,piece.team,x,y*pawnDirection,boardState)){
                possibleMoves.push(desiredPosition);
            }
        }
    }

    if(Referee.isEnPassantMove(piece.position, {x:piece.position.x-1,y:piece.position.y + pawnDirection}, piece.type, piece.team, boardState)){
        possibleMoves.push({x:piece.position.x-1,y:piece.position.y + pawnDirection});
    }
    if(Referee.isEnPassantMove(piece.position, {x:piece.position.x+1,y:piece.position.y + pawnDirection}, piece.type, piece.team, boardState)){
        possibleMoves.push({x:piece.position.x+1,y:piece.position.y + pawnDirection});
    }

    return possibleMoves;
}