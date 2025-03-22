import { PieceType, TeamType, Piece, Position, samePosition} from "../Constants";


export default class Referee{
    tileIsOccupied(position:Position, boardState: Piece[]):boolean{
        const piece = boardState.find((p) => samePosition(p.position,position));
        return piece?true:false;
    }

    tileIsOccupiedByOpponent(position:Position, boardState:Piece[], team:TeamType):boolean{
        const piece = boardState.find((p)=>samePosition(p.position, position) && p.team!==team);
        return piece?true:false;
    }

    isEnPassantMove(initialPosition: Position, desiredPosition:Position, type:PieceType, team:TeamType, boardState:Piece[]):boolean{
        const pawnDirection = (team === TeamType.OUR)? 1:-1;

        if(type===PieceType.PAWN){
            if(desiredPosition.y-initialPosition.y===pawnDirection && ((desiredPosition.x-initialPosition.x===-1) || (desiredPosition.x-initialPosition.x===1))){
                const piece = boardState.find((p)=> p.position.x===desiredPosition.x && (p.position.y===desiredPosition.y - pawnDirection && p.enPassant));

                return piece?true:false;
            }
        }
        return false;
    }

    pawnMove(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, boardState:Piece[]):boolean{
            const specialRow = (team === TeamType.OUR)?1:6;
            const pawnDirection = (team === TeamType.OUR)? 1:-1;

            if(initialPosition.x===desiredPosition.x && initialPosition.y===specialRow && dy===2*pawnDirection){
                if(!this.tileIsOccupied(desiredPosition,boardState) && !this.tileIsOccupied({x: desiredPosition.x, y:desiredPosition.y-pawnDirection}, boardState)){
                    return true;
                }
            }else if(initialPosition.x===desiredPosition.x && dy===pawnDirection){
                    return !this.tileIsOccupied(desiredPosition,boardState)
            }
            //attack
            else if(dy===pawnDirection && ((dx===-1) || (dx===1))){
                return this.tileIsOccupiedByOpponent(desiredPosition,boardState,team);
            }
        return false;
    }


    knightMove(initialPosition: Position, desiredPosition: Position, team: TeamType, dx: number, dy: number, boardState: Piece[]): boolean {
        // moving mechanics
        // 8 different tiles possible

        const knightX = [1, 2, 2, 1, -1, -2, -2, -1];
        const knightY = [2, 1, -1, -2, -2, -1, 1, 2];

        for (let i = 0; i < 8; i++) {
            if ((dx === knightX[i]) && (dy === knightY[i])) {
                return (!this.tileIsOccupied(desiredPosition, boardState) || this.tileIsOccupiedByOpponent(desiredPosition, boardState, team))
            }
        }
        return false;
    }

    bishopMove(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean{
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
                    if (this.tileIsOccupied(passedPosition, boardState)) {
                        return false;
                    }
                }

                // return true (if is not occupied by our team) or (is ocuppied by opponent)
                return !this.tileIsOccupied(desiredPosition, boardState) ||
                    this.tileIsOccupiedByOpponent(desiredPosition, boardState, team);
            }
        return false;
    }

    rookMove(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean{
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
                    if (this.tileIsOccupied(passedPosition, boardState)) {
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
                    if (this.tileIsOccupied(passedPosition, boardState)) {
                        return false;
                    }
                }
            } else {
            // if its not vertical nor horizontal movement
            return false;
        }
                // return true (if is not occupied by our team) or (is ocuppied by opponent)
                return !this.tileIsOccupied(desiredPosition, boardState) ||
                    this.tileIsOccupiedByOpponent(desiredPosition, boardState, team);
    }

    queenMove(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean{
        return (this.bishopMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState) || this.rookMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState));
    }

    kingMove(initialPosition:Position, desiredPosition: Position, team:TeamType,dx:number, dy:number, stepX:number, stepY:number, boardState:Piece[]):boolean{
            //one tile movement
            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1){
                return (!this.tileIsOccupied(desiredPosition, boardState) || this.tileIsOccupiedByOpponent(desiredPosition, boardState, team));
            }
        return false;
    }


    isValidMove(initialPosition:Position, desiredPosition: Position, type:PieceType, team:TeamType, boardState:Piece[]){
        console.log(`referee checking.. piece: ${type}`);
        //movement
        const dx = desiredPosition.x - initialPosition.x; // difference in X axis
        const dy = desiredPosition.y - initialPosition.y; // difference in Y axis
        const stepX = dx > 0 ? 1 : -1; // direction of X axis: 1 or -1
        const stepY = dy > 0 ? 1 : -1; // direction of Y axis: 1 or -1

        switch(type){
            case PieceType.PAWN:{
            return this.pawnMove(initialPosition, desiredPosition, team, dx, dy, boardState);
            }
            case PieceType.KNIGHT:{
            return this.knightMove(initialPosition, desiredPosition, team, dx, dy, boardState);
            }
            case PieceType.BISHOP:{
            return this.bishopMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
            case PieceType.ROOK:{
            return this.rookMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
            case PieceType.QUEEN:{
            return this.queenMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
            case PieceType.KING:{
            return this.kingMove(initialPosition, desiredPosition, team, dx, dy, stepX, stepY, boardState);
            }
        }

    }
}
