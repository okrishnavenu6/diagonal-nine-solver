import { SudokuBoard } from './sudokuGenerator';

export interface Conflict {
  row: number;
  col: number;
  type: 'row' | 'column' | 'box' | 'diagonal';
}

export const getConflicts = (board: SudokuBoard, row: number, col: number): Conflict[] => {
  const conflicts: Conflict[] = [];
  const value = board[row][col].value;

  if (value === 0) return conflicts;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === value) {
      conflicts.push({ row, col: c, type: 'row' });
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === value) {
      conflicts.push({ row: r, col, type: 'column' });
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === value) {
        conflicts.push({ row: r, col: c, type: 'box' });
      }
    }
  }

  // Check main diagonal (top-left to bottom-right)
  if (row === col) {
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][i].value === value) {
        conflicts.push({ row: i, col: i, type: 'diagonal' });
      }
    }
  }

  // Check anti-diagonal (top-right to bottom-left)
  if (row + col === 8) {
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][8 - i].value === value) {
        conflicts.push({ row: i, col: 8 - i, type: 'diagonal' });
      }
    }
  }

  return conflicts;
};

export const isValidMove = (board: SudokuBoard, row: number, col: number, value: number): boolean => {
  if (value === 0) return true;

  // Temporarily set the value to check conflicts
  const originalValue = board[row][col].value;
  board[row][col].value = value;
  const conflicts = getConflicts(board, row, col);
  board[row][col].value = originalValue;

  return conflicts.length === 0;
};

export const isPuzzleComplete = (board: SudokuBoard): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value === 0) return false;
      if (getConflicts(board, row, col).length > 0) return false;
    }
  }
  return true;
};

export const getCandidates = (board: SudokuBoard, row: number, col: number): Set<number> => {
  const candidates = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  if (board[row][col].value !== 0) return new Set();

  // Remove numbers in same row
  for (let c = 0; c < 9; c++) {
    if (board[row][c].value !== 0) {
      candidates.delete(board[row][c].value);
    }
  }

  // Remove numbers in same column
  for (let r = 0; r < 9; r++) {
    if (board[r][col].value !== 0) {
      candidates.delete(board[r][col].value);
    }
  }

  // Remove numbers in same 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c].value !== 0) {
        candidates.delete(board[r][c].value);
      }
    }
  }

  // Remove numbers in main diagonal
  if (row === col) {
    for (let i = 0; i < 9; i++) {
      if (board[i][i].value !== 0) {
        candidates.delete(board[i][i].value);
      }
    }
  }

  // Remove numbers in anti-diagonal
  if (row + col === 8) {
    for (let i = 0; i < 9; i++) {
      if (board[i][8 - i].value !== 0) {
        candidates.delete(board[i][8 - i].value);
      }
    }
  }

  return candidates;
};

export const isOnMainDiagonal = (row: number, col: number): boolean => row === col;
export const isOnAntiDiagonal = (row: number, col: number): boolean => row + col === 8;
export const isOnAnyDiagonal = (row: number, col: number): boolean => 
  isOnMainDiagonal(row, col) || isOnAntiDiagonal(row, col);
