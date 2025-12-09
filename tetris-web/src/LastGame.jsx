import { getLastGameLines } from "./persistence/localRepository";

const LastGame = () => {
    const lastGameLines = getLastGameLines();

    return (
        <div>
            <h1 className="title">LAST GAME</h1>
            {lastGameLines && <div>Lines: {lastGameLines}</div>}
            {lastGameLines && <div>Level: {Math.floor(Number.parseInt(lastGameLines)/10)+1}</div>}
            {!lastGameLines && <div>NO GAME PLAYED</div>}
        </div>
    );
};

export default LastGame;