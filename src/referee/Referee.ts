import { PieceType } from "../components/Chessboard/Chessboard";
import {TeamType} from "../components/Chessboard/Chessboard"



export default class Referee{
    isValidMove(px:number, py:number, x:number, y:number, type:PieceType, team:TeamType){
        console.log(`referee checking.. piece: ${type.toString}`);
        
        if(type === PieceType.PAWN){
            if(team === TeamType.OUR){
                // first movement 
                if(py===1){
                    // if does not change position in X axis
                    if(px===x && ( y-py===1 || y-py===2)){
                        return true;
                    }
                } else{
                    // not the first movement
                    // allows movement of 1 posicion upwards
                    if(px===x && y - py ===1){
                        return true;
                    }
                }
            }

        }
        return false;
    }
}