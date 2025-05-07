import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"


// bishop moves
const bishopX = [1, 1, -1, -1];
const bishopY = [1, -1, 1, -1];

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


export const GetPossibleBishopMoves = (piece:Piece, boardState:Piece[]):Position[]=>{
    const possibleMoves:Position[] = [];

 
    for(let i=0;i<4;i++){
        // analyze upper right diagonal
        // then down right diagonal
        // then upper left diagonal
        // then down left diagonal


        let x = piece.position.x + bishopX[i];
        let y = piece.position.y + bishopY[i];
        
        // check if the position is on the board
        while(x >= 0 && x < 8 && y >= 0 && y < 8) {
            const position = {x, y};
            //print posible moves
            if(bishopMove(piece.position, position, piece.team, bishopX[i], bishopY[i], bishopX[i], bishopY[i], boardState)){
                possibleMoves.push(position);
            }
            //stop if tile is occupied
            if(Referee.tileIsOccupied(position, boardState)) {
                break;
            }

            //move to next tile
            x += bishopX[i];
            y += bishopY[i];
        }
    }
    return possibleMoves;
}
