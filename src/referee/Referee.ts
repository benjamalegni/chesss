import { PieceType } from "../components/Chessboard/Chessboard";
import {TeamType} from "../components/Chessboard/Chessboard"
import {Piece} from "../components/Chessboard/Chessboard"



export default class Referee{
    tileIsOccupied(x: number,y: number, boardState: Piece[]):boolean{
        const piece = boardState.find(p=> p.x===x && p.y===y)
        return piece!=undefined;
    }

    tileIsOccupiedByOpponent(x:number, y:number, boardState:Piece[], team:TeamType):boolean{
        const piece = boardState.find((p)=>p.x===x && p.y===y && p.team!==team);
        return piece?true:false;
    }

    isEnPassantMove(px:number, py:number, x:number, y:number, type:PieceType, team:TeamType, boardState:Piece[]):boolean{
        const pawnDirection = (team === TeamType.OUR)? 1:-1;

        if(type===PieceType.PAWN){
            if(y-py===pawnDirection && ((x-px===-1) || (x-px===1))){
                const piece = boardState.find((p)=> p.x===x && (p.y===y - pawnDirection && p.enPassant));

                return piece?true:false;
            }
        }
        return false;
    }

    isValidMove(px:number, py:number, x:number, y:number, type:PieceType, team:TeamType, boardState:Piece[]){
        console.log(`referee checking.. piece: ${type}`);
        //movement
        if(type === PieceType.PAWN){
            const specialRow = (team === TeamType.OUR)?1:6;
            const pawnDirection = (team === TeamType.OUR)? 1:-1;

            if(px===x && py===specialRow && y-py===2*pawnDirection){
                if(!this.tileIsOccupied(x,y,boardState) && !this.tileIsOccupied(x,y - pawnDirection, boardState)){
                    return true;
                }
            }else if(px===x && y-py===pawnDirection){
                    if(!this.tileIsOccupied(x,y,boardState)){
                        return true;
                    }
            }
            //attack
            else if(y-py===pawnDirection && ((x-px===-1) || (x-px===1))){
                if(this.tileIsOccupiedByOpponent(x,y,boardState,team)){
                    return true;
                }
            }

        }

        return false;
    }
}