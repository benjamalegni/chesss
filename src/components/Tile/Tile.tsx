import './Tile.css'

interface Props{
	key:string;
	isEven:boolean;
	image?:string;
	highlight: boolean;
	capture?: boolean;
}

export default function Tile({isEven, image, highlight, capture}:Props){
	const className : string = ["tile", 
								isEven ? "b_tile" : "w_tile"
							].filter(Boolean).join(' ');

	return <div className={className}> 
					{image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
					{highlight && !capture && <div className="move-indicator" />}
					{capture && <div className="capture-indicator" />}
			</div>;
}