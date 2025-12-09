import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TetrisBoard from "./TetrisBoard";
import { leaveByUid } from "./persistence/playerRepository";
import { changeGameState, GAMESTATES, attachGameStateListener } from "./persistence/stateRepository";
import { getUsername, setLastGameLines } from "./persistence/localRepository";
import { SCORES_API } from "./constants";

function App() {
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lines, setLines] = useState(0);

  const username = getUsername();
  const navigate = useNavigate();

  const { state } = useLocation();
  const uid = state?.uid;

  const goToUsername = (e) => {
    e.preventDefault();
    navigate('/');
  };

  useEffect(() => {
    if (gameOver) {
      changeGameState(GAMESTATES.GAMEOVER);
    } else {
      paused ? changeGameState(GAMESTATES.PAUSE) : changeGameState(GAMESTATES.START);
    }
  }, [paused, gameOver]);

  useEffect(() => {
    const detachGameStateListener = attachGameStateListener(
        (gameState) => {
            if (gameState === GAMESTATES.GAMEOVER) {
              setGameOver(true);
            } else {
              if (gameState === GAMESTATES.PAUSE) {
                setPaused(true);
              } else {
                setPaused(false);
              }
            }
        },
        (err) => console.error("Database error: ", err)
    );

    return () => detachGameStateListener();
  });

  useEffect(() => {
    if (gameOver) {
      setLastGameLines(lines);

      fetch(SCORES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, lines: lines, level: Math.floor(Number.parseInt(lines)/10)+1 })
      })
        .then(async res => {
          if (!res.ok) {
            const err = await res.text();
            console.log("Error:", err.message);
            throw new Error(err || res.statusText);
          }
          const created = await res.json();
          console.log("Saved:", created);
        })
        .catch(err => console.error("Error:", err.message));

      setTimeout(() => {
        leaveByUid(uid);
        navigate('/lobby');
      }, 3000);
    }
  });

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
      <div className="layout">
        {/* tablero principal */}
        <div>
          <TetrisBoard
            uid={uid}
            paused={paused}
            setPaused={setPaused}
            gameOver={gameOver}
            setGameOver={setGameOver}
            lines={lines}
            setLines={setLines}
          />
        </div>

        {/* panel lateral */}
        <div className="panel">
          {paused && <div className="banner pause">Paused</div>}
          {gameOver && <div className="banner over">Game Over</div>}

          <div className="stat">Lines: {lines}</div>
          <div className="stat">Level: {Math.floor(lines/10)+1}</div>

          <div className="help">
            <p>← → Move</p>
            <p>↑ Rotate</p>
            <p>↓ Drop</p>
            <p>Space Hard drop</p>
            <p>P Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
