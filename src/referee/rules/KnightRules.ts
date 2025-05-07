import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

const knightX = [1, 2, 2, 1, -1, -2, -2, -1];
const knightY = [2, 1, -1, -2, -2, -1, 1, 2];

export const knightMove =(initialPosition: Position, desiredPosition: Position, team: TeamType, dx: number, dy: number, boardState: Piece[]):boolean=>{
        // moving mechanics
        // 8 different tiles possible
        for (let i = 0; i < 8; i++) {
            if ((dx === knightX[i]) && (dy === knightY[i])) {
                return (!Referee.tileIsOccupied(desiredPosition, boardState) || Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team))
            }
        }
        return false;
}



export const GetPossibleKnightMoves = (piece:Piece, boardState:Piece[]):Position[]=>{
    const possibleMoves:Position[] = [];

    for(let i=0;i<8;i++){
        if(knightMove(piece.position, {x:piece.position.x + knightX[i], y:piece.position.y + knightY[i]}, piece.team,knightX[i], knightY[i] , boardState)){
            possibleMoves.push({x:piece.position.x + knightX[i], y:piece.position.y + knightY[i]});
        }
    }
    return possibleMoves;
}