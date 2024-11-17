import './Tile.css'

interface Props{
    key:string;
    isEven:boolean;
    image?:string;
}

export default function Tile({isEven, image}:Props){
    return <div className={`tile ${isEven ? 'b_tile' : 'w_tile'}`}> 
                    {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
            </div>;
}