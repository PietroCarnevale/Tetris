import { useEffect, useState } from "react";
import { SCORES_API } from "./constants";

const Ranking = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SCORES_API)
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="title">BEST SCORES</h1>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title">BEST SCORES</h1>

      {/* Header */}
      <div style={{ display: "flex", fontWeight: "bold", marginBottom: "10px" }}>
        <div style={{ width: "150px" }}>PLAYER</div>
        <div style={{ width: "100px" }}>LINES</div>
        <div style={{ width: "100px" }}>LEVEL</div>
      </div>

      {/* List */}
      {scores.map(score => (
        <div
          key={score.id}
          style={{
            display: "flex",
            padding: "4px 0",
            borderBottom: "1px solid #ccc"
          }}
        >
          <div style={{ width: "150px" }}>{score.username}</div>
          <div style={{ width: "100px" }}>{score.lines}</div>
          <div style={{ width: "100px" }}>{score.level}</div>
        </div>
      ))}
    </div>
  );
};

export default Ranking;
