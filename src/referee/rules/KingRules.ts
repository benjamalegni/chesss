import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

export const kingMove=(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean=>{
            //one tile movement
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1){
                return (!Referee.tileIsOccupied(desiredPosition, boardState) || Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team));
            }
        return false;
}