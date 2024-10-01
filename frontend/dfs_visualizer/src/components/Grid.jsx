import { useState } from "react";
import axios from "axios";
import Square from "./Square";

function Grid() {
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [selectingStart, setSelectingStart] = useState(true);

  async function handleClick(i) {
    if (selectingStart) {
      setStartPosition(i);
      setSelectingStart(false);
    } else if (i !== startPosition) {
      setEndPosition(i);
      setSelectingStart(true);
      await findPath(startPosition, endPosition);
    }
  }

  async function findPath(start, end) {
    try {
      const response = await axios.post("http://localhost:8080/find-path", {
        start: { x: start % 20, y: Math.floor(start / 20) },
        end: { x: end % 20, y: Math.floor(end / 20) },
      });

      console.log(response.data);
      // TODO: Set the path using the response
    } catch (err) {
      console.error("Error finding path:", err);
    }
  }

  function renderSquare(i) {
    return (
      <Square
        key={i}
        isStart={i === startPosition}
        isEnd={i === endPosition}
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

  const status = selectingStart
    ? "Select start position"
    : "Select end position";

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>{status}</div>
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
    </div>
  );
}

export default Grid;
