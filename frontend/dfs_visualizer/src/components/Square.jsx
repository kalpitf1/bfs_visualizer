function Square({ isStart, isEnd, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "30px",
        height: "30px",
        border: "1px solid black",
        backgroundColor: "white",
        float: "left",
      }}
    >
      {isStart ? "S" : isEnd ? "E" : ""}
    </button>
  );
}

export default Square;
