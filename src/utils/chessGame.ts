export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type PieceColor = "white" | "black";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface ChessGameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
  isCheck: boolean;
  isCheckmate: boolean;
  moveHistory: string[];
}

export const initializeChessBoard = (): ChessGameState => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "black", hasMoved: false };
    board[6][i] = { type: "pawn", color: "white", hasMoved: false };
  }
  
  // Setup other pieces
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], color: "black", hasMoved: false };
    board[7][i] = { type: backRow[i], color: "white", hasMoved: false };
  }
  
  return {
    board,
    currentPlayer: "white",
    capturedPieces: { white: [], black: [] },
    isCheck: false,
    isCheckmate: false,
    moveHistory: []
  };
};

export const getValidMoves = (
  board: (ChessPiece | null)[][],
  fromRow: number,
  fromCol: number
): [number, number][] => {
  const piece = board[fromRow][fromCol];
  if (!piece) return [];

  const moves: [number, number][] = [];

  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? -1 : 1;
      const startRow = piece.color === "white" ? 6 : 1;

      // Move forward
      if (!board[fromRow + direction]?.[fromCol]) {
        moves.push([fromRow + direction, fromCol]);
        // Double move from start
        if (fromRow === startRow && !board[fromRow + 2 * direction]?.[fromCol]) {
          moves.push([fromRow + 2 * direction, fromCol]);
        }
      }

      // Capture diagonally
      [-1, 1].forEach(dx => {
        const target = board[fromRow + direction]?.[fromCol + dx];
        if (target && target.color !== piece.color) {
          moves.push([fromRow + direction, fromCol + dx]);
        }
      });
      break;

    case "rook":
      // Horizontal and vertical moves
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + dr * i;
          const newCol = fromCol + dc * i;
          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
          const target = board[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            if (target.color !== piece.color) moves.push([newRow, newCol]);
            break;
          }
        }
      });
      break;

    case "knight":
      // L-shaped moves
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
        const newRow = fromRow + dr;
        const newCol = fromCol + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target || target.color !== piece.color) {
            moves.push([newRow, newCol]);
          }
        }
      });
      break;

    case "bishop":
      // Diagonal moves
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + dr * i;
          const newCol = fromCol + dc * i;
          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
          const target = board[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            if (target.color !== piece.color) moves.push([newRow, newCol]);
            break;
          }
        }
      });
      break;

    case "queen":
      // Combination of rook and bishop
      [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
          const newRow = fromRow + dr * i;
          const newCol = fromCol + dc * i;
          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
          const target = board[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            if (target.color !== piece.color) moves.push([newRow, newCol]);
            break;
          }
        }
      });
      break;

    case "king":
      // One square in any direction
      [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
        const newRow = fromRow + dr;
        const newCol = fromCol + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target || target.color !== piece.color) {
            moves.push([newRow, newCol]);
          }
        }
      });
      break;
  }

  return moves;
};

export const makeMove = (
  gameState: ChessGameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): ChessGameState => {
  const newState = JSON.parse(JSON.stringify(gameState));
  const piece = newState.board[fromRow][fromCol];
  const capturedPiece = newState.board[toRow][toCol];
  
  if (capturedPiece) {
    newState.capturedPieces[capturedPiece.color].push(capturedPiece.type);
  }
  
  // Mark piece as moved
  if (piece) {
    piece.hasMoved = true;
  }
  
  newState.board[toRow][toCol] = piece;
  newState.board[fromRow][fromCol] = null;
  newState.currentPlayer = gameState.currentPlayer === "white" ? "black" : "white";
  
  // Add to move history
  const fromSquare = String.fromCharCode(97 + fromCol) + (8 - fromRow);
  const toSquare = String.fromCharCode(97 + toCol) + (8 - toRow);
  newState.moveHistory.push(`${piece?.type} ${fromSquare} → ${toSquare}`);
  
  return newState;
};

export const isKingInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  // Find king position
  let kingPos: [number, number] | null = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece?.type === "king" && piece.color === color) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // Check if any enemy piece can attack the king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color !== color) {
        const moves = getValidMoves(board, r, c);
        if (moves.some(([mr, mc]) => mr === kingPos![0] && mc === kingPos![1])) {
          return true;
        }
      }
    }
  }
  
  return false;
};
