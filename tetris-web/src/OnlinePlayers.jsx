import { useEffect, useState } from "react";
import { attachPlayerListener } from "./persistence/playerRepository";

const OnlinePlayers = () => {

    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const detachPlayerListener = attachPlayerListener(
            (data) => setPlayers(data),
            (err) => console.error("Database error: ", err)
        );
    
        return () => detachPlayerListener();
    });

    return (
        <div>
            <h1 className="title">ONLINE PLAYERS ({players.length})</h1>
            <ul>
                {players.map((username, index) => (
                    <li key={index}>{username}</li>
                ))}
            </ul>
        </div>
    );
};

export default OnlinePlayers;