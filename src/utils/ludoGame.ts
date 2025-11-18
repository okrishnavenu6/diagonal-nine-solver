export interface LudoPiece {
  position: number;
  isHome: boolean;
  isFinished: boolean;
}

export interface LudoPlayer {
  color: string;
  pieces: LudoPiece[];
}

export interface LudoGameState {
  players: LudoPlayer[];
  currentPlayer: number;
  lastDiceRoll: number;
}

export const initializeLudoGame = (): LudoGameState => {
  const colors = ["red", "green", "yellow", "blue"];
  const startPositions = [0, 15, 210, 225];
  
  return {
    players: colors.map((color, index) => ({
      color,
      pieces: Array(4).fill(null).map(() => ({
        position: startPositions[index],
        isHome: true,
        isFinished: false
      }))
    })),
    currentPlayer: 0,
    lastDiceRoll: 0
  };
};

export const rollDice = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

export const movePiece = (
  gameState: LudoGameState,
  playerIndex: number,
  pieceIndex: number,
  steps: number
): LudoGameState => {
  const newState = JSON.parse(JSON.stringify(gameState));
  const piece = newState.players[playerIndex].pieces[pieceIndex];
  
  if (piece.isHome && steps === 6) {
    piece.isHome = false;
    piece.position = [0, 15, 210, 225][playerIndex] + 1;
  } else if (!piece.isHome && !piece.isFinished) {
    piece.position += steps;
    if (piece.position >= 225) {
      piece.isFinished = true;
    }
  }
  
  // Switch to next player
  newState.currentPlayer = (playerIndex + 1) % 4;
  
  return newState;
};
