import Chessboard from "../Chessboard/Chessboard";
import "./GameComps.css"
import LoginComponent from "../../Login/LoginComponent";

function GameComps(){
    return <div id="component">
        <LoginComponent/>
        <Chessboard/>
    </div>
}

export default GameComps;