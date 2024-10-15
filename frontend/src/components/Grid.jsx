import { useState } from "react";
import axios from "axios";
import Square from "./Square";

function Grid() {
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [selectingMode, setSelectingMode] = useState("start"); // 'start', 'end', or 'obstacle'
  const [path, setPath] = useState([]);

  function handleReset() {
    setStartPosition(null);
    setEndPosition(null);
    setSelectingMode("start");
    setPath([]);
    setObstacles([]);
  }

  async function handleClick(i) {
    if (selectingMode === "start") {
      setStartPosition(i);
      setSelectingMode("end");
    } else if (selectingMode === "end") {
      if (i !== startPosition) {
        setEndPosition(i);
        setSelectingMode("obstacle");
      }
    } else if (selectingMode === "obstacle") {
      if (i !== startPosition && i !== endPosition) {
        const newObstacles = obstacles.includes(i)
          ? obstacles.filter((obs) => obs !== i)
          : [...obstacles, i];
        setObstacles(newObstacles);
      }
    }
  }

  async function findPath() {
    if (startPosition === null || endPosition === null) {
      console.log("need both start and end pos set before finding path");
      return;
    }

    const data = {
      start: { x: Math.floor(startPosition / 20), y: startPosition % 20 },
      end: { x: Math.floor(endPosition / 20), y: endPosition % 20 },
      obstacles: obstacles.map((obs) => ({
        x: Math.floor(obs / 20),
        y: obs % 20,
      })),
    };

    try {
      const response = await axios.post(
        "https://bfs-visualizer-u2rl.onrender.com/find-path",
        data
      );

      console.log(response.data);
      setPath(response.data.path);
    } catch (err) {
      console.error("Error finding path:", err);
    }
  }

  function isInPath(x, y) {
    if (path.find((point) => point.x === x && point.y === y)) {
      return true;
    }
    return false;
  }

  function renderSquare(i) {
    const x = Math.floor(i / 20);
    const y = i % 20;
    return (
      <Square
        key={i}
        isStart={i === startPosition}
        isEnd={i === endPosition}
        isPath={isInPath(x, y)}
        isObstacle={obstacles.includes(i)}
        onClick={() => handleClick(i)}
      />
    );
  }

  function renderRow(rowIndex) {
    return (
      <div key={rowIndex} style={{ clear: "both" }}>
        {[...Array(20)].map((_, colIndex) =>
          renderSquare(rowIndex * 20 + colIndex)
        )}
      </div>
    );
  }

  function getStatus() {
    switch (selectingMode) {
      case "start":
        return "Select start position";
      case "end":
        return "Select end position";
      case "obstacle":
        return 'Add or remove obstacles, then click "Find Path"';
      default:
        return "";
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>{getStatus()}</div>
      <div>{[...Array(20)].map((_, rowIndex) => renderRow(rowIndex))}</div>
      <div style={{ marginTop: "10px", clear: "both" }}>
        Start:{" "}
        {startPosition !== null
          ? `(${Math.floor(startPosition / 20)}, ${startPosition % 20})`
          : "Not set"}
        <br />
        End:{" "}
        {endPosition !== null
          ? `(${Math.floor(endPosition / 20)}, ${endPosition % 20})`
          : "Not set"}
      </div>
      <button
        onClick={findPath}
        style={{ marginTop: "10px" }}
        disabled={startPosition === null || endPosition === null}
      >
        Find Path
      </button>
      {/* {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>} */}
      <button onClick={handleReset} style={{ marginTop: "10px" }}>
        Reset
      </button>
    </div>
  );
}

export default Grid;
