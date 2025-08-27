export const XAXIS = ["a","b","c","d","e","f","g","h"];
export const YAXIS = ["1","2","3","4","5","6","7","8"];

export const GRIDSIZE = 100;

export function samePosition(p1:Position, p2:Position){
    return p1.x===p2.x && p1.y===p2.y;
}

export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export interface Position{
    x:number;
    y:number;
}

export enum TeamType{
    OPPONENT,
    OUR 
}

export interface Piece{
    image: string
    position: Position
    type: PieceType
    team: TeamType
    enPassant?:boolean
    possibleMoves?: Position[];
}

function withPublicUrl(relativePath: string): string{
    const prefix = (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
    const rel = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${prefix}${rel}`;
}

// Helper to build stable image paths using PUBLIC_URL
function imagePathFor(type: PieceType, team: TeamType): string{
    const teamCode = team === TeamType.OUR ? 'w' : 'b';
    let name = '';
    switch(type){
        case PieceType.PAWN: name = 'pawn'; break;
        case PieceType.BISHOP: name = 'bishop'; break;
        case PieceType.KNIGHT: name = 'knight'; break;
        case PieceType.ROOK: name = 'rook'; break;
        case PieceType.QUEEN: name = 'queen'; break;
        case PieceType.KING: name = 'king'; break;
    }
    return withPublicUrl(`assets/images/${name}_${teamCode}.svg`);
}

export const initialBoardState: Piece[] = [
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:0, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:1, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:2, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:3, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:4, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:5, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:6, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OPPONENT),
        position:{ x:7, y:6 },
        type: PieceType.PAWN,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.ROOK, TeamType.OPPONENT),
        position:{ x:0, y:7 },
        type: PieceType.ROOK,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.KNIGHT, TeamType.OPPONENT),
        position:{ x:1, y:7 },
        type: PieceType.KNIGHT,
        team: TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.BISHOP, TeamType.OPPONENT),
        position:{ x:2, y:7 },
        type:PieceType.BISHOP,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.QUEEN, TeamType.OPPONENT),
        position:{ x:3, y:7 },
        type:PieceType.QUEEN,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.KING, TeamType.OPPONENT),
        position:{ x:4, y:7 },
        type:PieceType.KING,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.BISHOP, TeamType.OPPONENT),
        position:{ x:5, y:7 },
        type:PieceType.BISHOP,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.KNIGHT, TeamType.OPPONENT),
        position:{ x:6, y:7 },
        type:PieceType.KNIGHT,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.ROOK, TeamType.OPPONENT),
        position:{ x:7, y:7 },
        type:PieceType.ROOK,
        team:TeamType.OPPONENT,
    },
    {
        image: imagePathFor(PieceType.ROOK, TeamType.OUR),
        position:{ x:0, y:0 },
        type: PieceType.ROOK,
        team: TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.KNIGHT, TeamType.OUR),
        position:{ x:1, y:0 },
        type: PieceType.KNIGHT,
        team: TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.BISHOP, TeamType.OUR),
        position:{ x:2, y:0 },
        type:PieceType.BISHOP,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.QUEEN, TeamType.OUR),
        position:{ x:3, y:0 },
        type:PieceType.QUEEN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.KING, TeamType.OUR),
        position:{ x:4, y:0 },
        type:PieceType.KING,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.BISHOP, TeamType.OUR),
        position:{ x:5, y:0 },
        type:PieceType.BISHOP,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.KNIGHT, TeamType.OUR),
        position:{ x:6, y:0 },
        type:PieceType.KNIGHT,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.ROOK, TeamType.OUR),
        position:{ x:7, y:0 },
        type:PieceType.ROOK,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:0, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:1, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:2, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:3, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:4, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:5, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:6, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
    {
        image: imagePathFor(PieceType.PAWN, TeamType.OUR),
        position:{ x:7, y:1 },
        type:PieceType.PAWN,
        team:TeamType.OUR,
    },
];