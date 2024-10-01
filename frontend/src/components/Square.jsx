function Square({ isStart, isEnd, isPath, isObstacle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "30px",
        height: "30px",
        border: "1px solid black",
        backgroundColor: isPath ? "green" : isObstacle ? "gray" : "white",
        float: "left",
      }}
    >
      {isStart ? "S" : isEnd ? "E" : ""}
    </button>
  );
}

export default Square;
