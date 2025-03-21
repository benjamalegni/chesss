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

    isValidMove(initialPosition:Position, desiredPosition: Position, type:PieceType, team:TeamType, boardState:Piece[]){
        console.log(`referee checking.. piece: ${type}`);
        //movement
        if(type === PieceType.PAWN){
            const specialRow = (team === TeamType.OUR)?1:6;
            const pawnDirection = (team === TeamType.OUR)? 1:-1;

            if(initialPosition.x===desiredPosition.x && initialPosition.y===specialRow && desiredPosition.y-initialPosition.y===2*pawnDirection){
                if(!this.tileIsOccupied(desiredPosition,boardState) && !this.tileIsOccupied({x: desiredPosition.x, y:desiredPosition.y-pawnDirection}, boardState)){
                    return true;
                }
            }else if(initialPosition.x===desiredPosition.x && desiredPosition.y-initialPosition.y===pawnDirection){
                    return !this.tileIsOccupied(desiredPosition,boardState)
            }
            //attack
            else if(desiredPosition.y-initialPosition.y===pawnDirection && ((desiredPosition.x-initialPosition.x===-1) || (desiredPosition.x-initialPosition.x===1))){
                return this.tileIsOccupiedByOpponent(desiredPosition,boardState,team);
            }
        } else if(type === PieceType.KNIGHT){
            // moving mechanics
            // 8 different tiles possible

            const knightX = [1,2,2,1,-1,-2,-2,-1];
            const knightY = [2,1,-1,-2,-2,-1,1,2];

            for(let i=0;i<8;i++){
                if((desiredPosition.x - initialPosition.x === knightX[i]) && (desiredPosition.y - initialPosition.y === knightY[i])){
                    return (!this.tileIsOccupied(desiredPosition,boardState) || this.tileIsOccupiedByOpponent(desiredPosition,boardState, team))
                } 
            }
        } else if (type === PieceType.BISHOP) {
            const dx = desiredPosition.x - initialPosition.x; // difference in X axis
            const dy = desiredPosition.y - initialPosition.y; // difference in Y axis
            
            // diagonal movement implies that difference between axis should be equal
            if (Math.abs(dx) === Math.abs(dy)) {
                const stepX = dx > 0 ? 1 : -1; // direction of X axis: 1 or -1
                const stepY = dy > 0 ? 1 : -1; // direction of Y axis: 1 or -1
                
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
        }

        return false;
    }
}
