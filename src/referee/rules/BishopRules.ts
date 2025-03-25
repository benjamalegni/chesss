import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

export const bishopMove=(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean=>{
            // diagonal movement implies that difference between axis should be equal
            if (Math.abs(dx) === Math.abs(dy)) {

                // iterate all positions between actual position and desired position (dx or dy)
                for (let i = 1; i < Math.abs(dx); i++) {
                    // change passedPosition in each iteration and multiply with step depending on each of the 4 directions is heading
                    const passedPosition: Position = {
                        x: initialPosition.x + i * stepX,
                        y: initialPosition.y + i * stepY,
                    };

                    // if any intermediate tile is occupied, then is invalid
                    if (Referee.tileIsOccupied(passedPosition, boardState)) {
                        return false;
                    }
                }

                // return true (if is not occupied by our team) or (is ocuppied by opponent)
                return !Referee.tileIsOccupied(desiredPosition, boardState) ||
                    Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team);
            }
        return false;
    }