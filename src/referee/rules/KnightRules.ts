import { Piece, Position, TeamType } from "../../Constants";
import Referee from "../Referee"

export const knightMove =(initialPosition: Position, desiredPosition: Position, team: TeamType, dx: number, dy: number, boardState: Piece[]):boolean=>{
        // moving mechanics
        // 8 different tiles possible

        const knightX = [1, 2, 2, 1, -1, -2, -2, -1];
        const knightY = [2, 1, -1, -2, -2, -1, 1, 2];

        for (let i = 0; i < 8; i++) {
            if ((dx === knightX[i]) && (dy === knightY[i])) {
                return (!Referee.tileIsOccupied(desiredPosition, boardState) || Referee.tileIsOccupiedByOpponent(desiredPosition, boardState, team))
            }
        }
        return false;
}
