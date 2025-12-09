import { useEffect, useState, useRef } from "react";
import LastGame from "./LastGame";
import OnlinePlayers from "./OnlinePlayers";
import Ranking from "./Ranking";
import { getUsername } from "./persistence/localRepository";
import { enterLobby } from "./persistence/playerRepository";
import { GAMESTATES, changeGameState, attachGameStateListener } from "./persistence/stateRepository"
import { useNavigate } from "react-router-dom";

const Lobby = () => {
    const username = getUsername();
    const navigate = useNavigate();

    const [uid, setUid] = useState(null);
    const didEnterLobbyRef = useRef(false);
    const leaveRef = useRef(null);
    
    const goToUsername = (e) => {
        e.preventDefault();
        navigate('/');
    };

    useEffect(() => {
        if (!username) return;
        if (didEnterLobbyRef.current) return;
        didEnterLobbyRef.current = true;

        (async () => {
            try {
                const { uid: newUid, leave: leave } = await enterLobby(username);
                setUid(newUid);
                leaveRef.current = leave;
            } catch (err) {
                console.error("Error joining lobby: ", err);
            }
        })();

        return () => {};
    }, [username]);

    useEffect(() => {
        if (!username) return;

        const handleKeyDown = (e) => {
            if (e.code === "Enter") {
                e.preventDefault();
                changeGameState(GAMESTATES.START);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [username]);

    useEffect(() => {
        if (!username || !uid) return;
        
        const detachGameStateListener = attachGameStateListener(
            (gameState) => {
                if (gameState === GAMESTATES.START) {
                    navigate('/game', { state : { uid } });
                }
            },
            (err) => console.error("Database error: ", err)
        );

        return () => detachGameStateListener();
    }, [username, navigate, uid]);

    if (!username) {
        return (
            <div className="message">
                <p>You need a username to play</p>
                <form onSubmit={goToUsername}>
                    <button type="submit">GO</button>
                </form>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="lobby">
                <LastGame />
                <OnlinePlayers />
                <Ranking />
            </div>
            <h2>PRESS ENTER TO START THE GAME</h2>
        </div>
    );
};

export default Lobby;