import { boolean } from 'yargs';
import './Tile.css'

interface Props{
    key:string;
    isEven:boolean;
    image?:string;
    highlight: boolean;
}

export default function Tile({isEven, image, highlight}:Props){
    const className : string = ["tile", 
                                isEven && "b_tile",
                                !isEven && "w_tile",
                                highlight && "tile-highlight"].filter(Boolean).join(' ');



    return <div className={className}> 
                    {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
            </div>;
}