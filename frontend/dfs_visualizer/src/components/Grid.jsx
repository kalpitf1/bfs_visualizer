import { useState } from "react";
import axios from "axios";
import Square from "./Square";

function Grid() {
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const [path, setPath] = useState([]);

  async function handleClick(i) {
    if (selectingStart) {
      setPath([]);
      setStartPosition(i);
      setSelectingStart(false);
    } else if (i !== startPosition) {
      setEndPosition(i);
      setSelectingStart(true);
      // console.log("inside handleClick: ", startPosition, endPosition); // endPosition does not get set in time here
      const newStart = startPosition;
      const newEnd = i;
      await findPath(newStart, newEnd);
    }
  }

  async function findPath(start, end) {
    const data = {
      start: { y: start % 20, x: Math.floor(start / 20) },
      end: { y: end % 20, x: Math.floor(end / 20) },
    };
    try {
      const response = await axios.post(
        "http://localhost:8080/find-path",
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
