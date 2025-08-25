import './Tile.css'

interface Props{
	key:string;
	isEven:boolean;
	image?:string;
	highlight: boolean;
	capture?: boolean;
	onClick?: () => void;
}

export default function Tile({isEven, image, highlight, capture, onClick}:Props){
	const className : string = ["tile", 
								isEven ? "b_tile" : "w_tile",
								highlight ? "clickable" : ""
							].filter(Boolean).join(' ');

	return <div className={className} onClick={onClick}> 
					{image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece"></div>}
					{highlight && !capture && <div className="move-indicator" />}
					{capture && <div className="capture-indicator" />}
			</div>;
}