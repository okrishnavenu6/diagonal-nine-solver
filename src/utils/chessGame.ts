export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
export type PieceColor = "white" | "black";

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
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
}

export const initializeChessBoard = (): ChessGameState => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Setup pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "black" };
    board[6][i] = { type: "pawn", color: "white" };
  }
  
  // Setup other pieces
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], color: "black" };
    board[7][i] = { type: backRow[i], color: "white" };
  }
  
  return {
    board,
    currentPlayer: "white",
    capturedPieces: { white: [], black: [] },
    isCheck: false,
    isCheckmate: false
  };
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
  
  newState.board[toRow][toCol] = piece;
  newState.board[fromRow][fromCol] = null;
  newState.currentPlayer = gameState.currentPlayer === "white" ? "black" : "white";
  
  return newState;
};
