import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"


// rook moves
const rookX = [1, -1, 0, 0];
const rookY = [0, 0, 1, -1];

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

    export const GetPossibleRookMoves = (piece:Piece, boardState:Piece[]):Position[]=>{
        const possibleMoves:Position[] = [];

        for(let i=0;i<4;i++){
            let x = piece.position.x + rookX[i];
            let y = piece.position.y + rookY[i];

            while(x >= 0 && x < 8 && y >= 0 && y < 8){
                const position = {x, y};
                if(rookMove(piece.position, position, piece.team, rookX[i], rookY[i], rookX[i], rookY[i], boardState)){
                    possibleMoves.push(position);
                }
                if(Referee.tileIsOccupied(position, boardState)){
                    break;
                }
                
                x+=rookX[i];
                y+=rookY[i];
            }
        }
        return possibleMoves;
    }