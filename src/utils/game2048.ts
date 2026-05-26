export interface Game2048State {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
}

const GRID_SIZE = 4;

export const initialize2048 = (): Game2048State => {
  const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  addRandomTile(board);
  addRandomTile(board);
  
  return {
    board,
    score: 0,
    bestScore: parseInt(localStorage.getItem("2048-best") || "0"),
    gameOver: false
  };
};

const addRandomTile = (board: number[][]) => {
  const emptyCells: [number, number][] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
  }
};

const moveLeft = (board: number[][]): [number[][], number] => {
  const newBoard = board.map(row => [...row]);
  let scoreIncrease = 0;
  
  for (let i = 0; i < GRID_SIZE; i++) {
    let row = newBoard[i].filter(cell => cell !== 0);
    
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1]) {
        row[j] *= 2;
        scoreIncrease += row[j];
        row.splice(j + 1, 1);
      }
    }
    
    while (row.length < GRID_SIZE) {
      row.push(0);
    }
    
    newBoard[i] = row;
  }
  
  return [newBoard, scoreIncrease];
};

const rotateBoard = (board: number[][]): number[][] => {
  const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      newBoard[j][GRID_SIZE - 1 - i] = board[i][j];
    }
  }
  return newBoard;
};

const boardsEqual = (board1: number[][], board2: number[][]): boolean => {
  return board1.every((row, i) => row.every((cell, j) => cell === board2[i][j]));
};

export const move2048 = (
  gameState: Game2048State,
  direction: "up" | "down" | "left" | "right"
): Game2048State => {
  let board = gameState.board.map(row => [...row]);
  let rotations = 0;

  switch (direction) {
    case "right":
      rotations = 2;
      break;
    case "up":
      rotations = 3;
      break;
    case "down":
      rotations = 1;
      break;
  }

  for (let i = 0; i < rotations; i++) {
    board = rotateBoard(board);
  }

  const [movedBoard, scoreIncrease] = moveLeft(board);
  board = movedBoard;

  // Rotate back to original orientation
  const restoreRotations = (4 - rotations) % 4;
  for (let i = 0; i < restoreRotations; i++) {
    board = rotateBoard(board);
  }

  if (boardsEqual(gameState.board, board)) {
    return gameState;
  }

  addRandomTile(board);

  const newScore = gameState.score + scoreIncrease;
  const newBestScore = Math.max(newScore, gameState.bestScore);

  if (newBestScore > gameState.bestScore) {
    localStorage.setItem("2048-best", newBestScore.toString());
  }

  const hasEmptyCell = board.some(row => row.some(cell => cell === 0));
  const gameOver = !hasEmptyCell && !checkForValidMoves(board);

  return {
    board,
    score: newScore,
    bestScore: newBestScore,
    gameOver,
  };
};

const checkForValidMoves = (board: number[][]): boolean => {
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const current = board[i][j];
      if (j < GRID_SIZE - 1 && current === board[i][j + 1]) return true;
      if (i < GRID_SIZE - 1 && current === board[i + 1][j]) return true;
    }
  }
  return false;
};
