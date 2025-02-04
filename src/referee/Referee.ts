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
        } else if(type === PieceType.BISHOP){
            if((Math.abs(((desiredPosition.x - initialPosition.x) + (desiredPosition.y-initialPosition.y))) % 2)===0){
                return (!this.tileIsOccupied(desiredPosition,boardState) || this.tileIsOccupiedByOpponent(desiredPosition,boardState,team));
            }
        }

        return false;
    }
}