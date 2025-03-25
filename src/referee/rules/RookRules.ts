import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

export const rookMove=(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean=>{
            // vertical movement
            if (dx === 0){
                // iterate all positions between actual position and desired position dy
                for (let i = 1; i < Math.abs(dy); i++) {
                    // maintain x position and iterate y axis from initial position to desiredPosition multiplying by its direction
                    const passedPosition: Position = {
                        x: initialPosition.x,
                        y: initialPosition.y + i * stepY,
                    };

                    // if any intermediate tile is occupied, then is invalid
                    if (Referee.tileIsOccupied(passedPosition, boardState)) {
                        return false;
                    }
                }
            } // horizontal movement
            else if (dy === 0) {
                // iterate all positions between actual position and desired position dx
                for (let i = 1; i < Math.abs(dx); i++) {
                    // maintain y position and iterate x axis from initial position to desiredPosition multiplying by its direction
                    const passedPosition: Position = {
                        x: initialPosition.x + i * stepX,
                        y: initialPosition.y,
                    };

                    // if any intermediate tile is occupied, then is invalid
                    if (Referee.tileIsOccupied(passedPosition, boardState)) {
                        return false;
                    }
                }
            } else {
            // if its not vertical nor horizontal movement
            return false;
        }
                // return true (if is not occupied by our team) or (is ocuppied by opponent)
                return !Referee.tileIsOccupied(desiredPosition, boardState) ||
                    Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team);
    }
