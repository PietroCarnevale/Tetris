import { useState, useEffect } from "react";
import { ROWS, COLS, SPEED, SHAPES, COLORS } from "./constants";
import { attachAttackListener, sendAttack, updateAttack } from "./persistence/playerRepository";


function randomPiece(startingX = 0) {
  const keys = Object.keys(SHAPES);
  const type = keys[Math.floor(Math.random() * keys.length)];
  return { type, rotation: 0, x: startingX, y: 0 };
}


function rotate(piece, dir = 1) {
  const total = SHAPES[piece.type].length;
  return { ...piece, rotation: (piece.rotation + dir + total) % total };
}


function getMatrix(piece) {
  return SHAPES[piece.type][piece.rotation];
}

const TetrisBoard = ({
  uid,
  paused,
  setPaused,
  gameOver,
  setGameOver,
  lines,
  setLines,
}) => {
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [nextBoard, setNextBoard] = useState(
    Array.from({ length: 4 }, () => Array(4).fill(null))
  );

  const [piece, setPiece] = useState(randomPiece(3));
  const [nextPiece, setNextPiece] = useState(randomPiece(0));

  const [attack, setAttack] = useState(0);

  const collide = (b, p, offX = 0, offY = 0) => {
    const m = getMatrix(p);
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;

        const nx = p.x + x + offX;
        const ny = p.y + y + offY;

        if (ny < 0) continue;

        if (nx < 0 || nx >= COLS || ny >= ROWS) return true; 

        if (b[ny][nx]) return true;
      }
    }
    return false;
  };


  const merge = (b, p) => {
    const m = getMatrix(p);
    const newBoard = b.map((r) => r.slice());

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x]) {
          const ny = p.y + y;
          const nx = p.x + x;
          if (ny >= 0) newBoard[ny][nx] = p.type;
        }
      }
    }
    return newBoard;
  };


  const clearLines = (b) => {
    const rowsKept = b.filter((r) => r.some((c) => !c));
    const cleared = ROWS - rowsKept.length;
	
    const newRows = Array.from({ length: cleared }, () =>
      Array(COLS).fill(null)
    );

    return { clearedBoard: [...newRows, ...rowsKept], cleared };
  };


  const spawn = () => {
    const newPiece = randomPiece(0);
    const nextUpdatedPosition = { type: nextPiece.type, rotation: nextPiece.rotation, x: 3, y: nextPiece.y };
    if (collide(board, nextUpdatedPosition, 0, 0)) setGameOver(true);
    else {
      setPiece(nextUpdatedPosition);
      setNextPiece(newPiece);
    }
  };


  const stepDown = () => {
    if (gameOver || paused) return;

    if (!collide(board, piece, 0, 1)) {
      setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      const merged = merge(board, piece);
      const { clearedBoard, cleared } = clearLines(merged);
      if (attack > 0) {
        const newBoard = addLines(clearedBoard);
        setBoard(newBoard);
        setAttack(0);
        updateAttack(uid, 0);
      } else {
        setBoard(clearedBoard);
      }
      if (cleared > 0) {
        setLines((l) => l + cleared);
        sendAttack(uid, cleared);
      }

      spawn();
    }
  };

  const generateLine = () => {
    const cells = Array(8).fill("W").concat(Array(2).fill(null));

    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    return cells;
  };

  const addLines = (b) => {
    const garbageLines = Array.from({ length: attack }, generateLine);
    
    const newBoard = [...b, ...garbageLines].slice(-ROWS);
    return newBoard;
  };

  useEffect(() => {
    const detachAttackListener = attachAttackListener(
      uid,
      (att) => setAttack(att),
      (err) => console.error("Database error: ", err)
    );

    return () => detachAttackListener();
  });

  useEffect(() => {
    if (gameOver || paused) return;
    const level = Math.floor(lines/10)+1;
    const stepTime = Math.max(SPEED - (level-1)*30, 100);
    const interval = setInterval(stepDown, stepTime);
    return () => clearInterval(interval);
  });


  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
      if (keys.includes(e.key) || keys.includes(e.code)) e.preventDefault();

      if (gameOver) return;

      if (e.code === "KeyP") return setPaused((p) => !p);

      if (paused) return;

      if (e.key === "ArrowLeft" && !collide(board, piece, -1, 0))
        setPiece((p) => ({ ...p, x: p.x - 1 }));

      if (e.key === "ArrowRight" && !collide(board, piece, 1, 0))
        setPiece((p) => ({ ...p, x: p.x + 1 }));

      if (e.key === "ArrowDown") stepDown();

      if (e.key === "ArrowUp") {
        const rotated = rotate(piece);
        if (!collide(board, rotated, 0, 0)) setPiece(rotated);
      }

      if (e.code === "Space") {
        let dy = 0;
        while (!collide(board, piece, 0, dy + 1)) dy++;

        const landed = { ...piece, y: piece.y + dy };
        const merged = merge(board, landed);
        const { clearedBoard, cleared } = clearLines(merged);

        if (attack > 0) {
          const newBoard = addLines(clearedBoard);
          setBoard(newBoard);
          setAttack(0);
          updateAttack(uid, 0);
        } else {
          setBoard(clearedBoard);
        }
        if (cleared > 0) {
          setLines((l) => l + cleared);
          sendAttack(uid, cleared);
        }

        spawn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });


  const getRenderBoard = (board, piece) => {

    const temp = board.map((row) => [...row]);
    const m = getMatrix(piece);

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;

        const ny = piece.y + y;
        const nx = piece.x + x;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          temp[ny][nx] = piece.type;
        }
      }
    }
    return temp;
  };


  return (
    <div style={{display: "flex", gap: "24px"}}>
      <div>
        <h2>Next piece</h2>
        <div className="nextBoard">
          {getRenderBoard(nextBoard, nextPiece).map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`n${r}-${c}`}
                className="cell"
                style={{
                  backgroundColor: cell ? COLORS[cell] : "transparent",
                }}
              />
            ))
          )}
        </div>
      </div>
      <div>
        <h1 className="title">Tetris</h1>
        <div className="board">
          {getRenderBoard(board, piece).map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="cell"
                style={{
                  backgroundColor: cell ? COLORS[cell] : "transparent",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TetrisBoard;
