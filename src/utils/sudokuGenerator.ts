export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuCell {
  value: number;
  given: boolean;
  pencilMarks: Set<number>;
}

export type SudokuBoard = SudokuCell[][];

const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  // Check main diagonal (top-left to bottom-right)
  if (row === col) {
    for (let i = 0; i < 9; i++) {
      if (board[i][i] === num) return false;
    }
  }

  // Check anti-diagonal (top-right to bottom-left)
  if (row + col === 8) {
    for (let i = 0; i < 9; i++) {
      if (board[i][8 - i] === num) return false;
    }
  }

  return true;
};

const solveSudoku = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        // Shuffle for randomness
        for (let i = numbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateCompleteBoard = (): number[][] => {
  const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
  solveSudoku(board);
  return board;
};

const countSolutions = (board: number[][], limit: number = 2): number => {
  let count = 0;

  const solve = (): boolean => {
    if (count >= limit) return true;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve()) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return false;
  };

  const boardCopy = board.map(row => [...row]);
  solve();
  // Restore board
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      board[i][j] = boardCopy[i][j];
    }
  }

  return count;
};

const removeNumbers = (board: number[][], difficulty: Difficulty): number[][] => {
  const cellsToRemove = {
    easy: 35,
    medium: 45,
    hard: 52,
    expert: 58,
  }[difficulty];

  const puzzle = board.map(row => [...row]);
  const cells: [number, number][] = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cells.push([i, j]);
    }
  }

  // Shuffle cells
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  let removed = 0;
  for (const [row, col] of cells) {
    if (removed >= cellsToRemove) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Check if puzzle still has unique solution
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
};

export const generatePuzzle = (difficulty: Difficulty): { puzzle: SudokuBoard; solution: number[][] } => {
  const completeBoard = generateCompleteBoard();
  const puzzle = removeNumbers(completeBoard, difficulty);

  const sudokuBoard: SudokuBoard = puzzle.map((row, i) =>
    row.map((cell, j) => ({
      value: cell,
      given: cell !== 0,
      pencilMarks: new Set<number>(),
    }))
  );

  return {
    puzzle: sudokuBoard,
    solution: completeBoard,
  };
};

export const deepCopyBoard = (board: SudokuBoard): SudokuBoard => {
  return board.map(row =>
    row.map(cell => ({
      value: cell.value,
      given: cell.given,
      pencilMarks: new Set(cell.pencilMarks),
    }))
  );
};
