export type TicTacToeCell = "X" | "O" | null;
export type TicTacToeBoard = TicTacToeCell[];
export type AIDifficulty = "easy" | "medium" | "hard";

export const WINNING_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export interface WinnerResult {
  winner: "X" | "O" | null;
  line: number[] | null;
}

export const getWinnerWithLine = (board: TicTacToeBoard): WinnerResult => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
};

export const checkWinner = (board: TicTacToeBoard): "X" | "O" | null =>
  getWinnerWithLine(board).winner;

export const isBoardFull = (board: TicTacToeBoard): boolean =>
  board.every((c) => c !== null);

const availableMoves = (board: TicTacToeBoard): number[] =>
  board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);

// Minimax with alpha-beta pruning. `ai` is the AI's mark.
const minimax = (
  board: TicTacToeBoard,
  isMaximizing: boolean,
  ai: "X" | "O",
  human: "X" | "O",
  depth: number,
  alpha: number,
  beta: number,
): number => {
  const winner = checkWinner(board);
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of availableMoves(board)) {
      board[i] = ai;
      best = Math.max(best, minimax(board, false, ai, human, depth + 1, alpha, beta));
      board[i] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of availableMoves(board)) {
      board[i] = human;
      best = Math.min(best, minimax(board, true, ai, human, depth + 1, alpha, beta));
      board[i] = null;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
};

const bestMove = (board: TicTacToeBoard, ai: "X" | "O"): number => {
  const human: "X" | "O" = ai === "X" ? "O" : "X";
  let best = -Infinity;
  let move = -1;
  const work = [...board];
  for (const i of availableMoves(work)) {
    work[i] = ai;
    const score = minimax(work, false, ai, human, 0, -Infinity, Infinity);
    work[i] = null;
    if (score > best) {
      best = score;
      move = i;
    }
  }
  return move;
};

// Medium: take winning move, block opponent winning move, else random.
const findWinningMove = (board: TicTacToeBoard, mark: "X" | "O"): number => {
  for (const i of availableMoves(board)) {
    const test = [...board];
    test[i] = mark;
    if (checkWinner(test) === mark) return i;
  }
  return -1;
};

export const getAIMove = (
  board: TicTacToeBoard,
  ai: "X" | "O",
  difficulty: AIDifficulty,
): number => {
  const moves = availableMoves(board);
  if (moves.length === 0) return -1;
  const human: "X" | "O" = ai === "X" ? "O" : "X";

  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === "medium") {
    const win = findWinningMove(board, ai);
    if (win >= 0) return win;
    const block = findWinningMove(board, human);
    if (block >= 0) return block;
    if (board[4] === null) return 4;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // hard
  return bestMove(board, ai);
};
