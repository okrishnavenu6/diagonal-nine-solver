export interface LudoPiece {
  position: number; // -1 = home, 0-51 = board path, 52-57 = home stretch, 58 = finished
  isHome: boolean;
  isFinished: boolean;
}

export interface LudoPlayer {
  color: string;
  name: string;
  pieces: LudoPiece[];
  startPosition: number;
  homeStretchStart: number;
}

export interface LudoGameState {
  players: LudoPlayer[];
  currentPlayer: number;
  lastDiceRoll: number;
  canRollAgain: boolean;
  moveCount: number;
  winner: number | null;
}

const PLAYER_COLORS = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"]; // red, green, yellow, blue
const PLAYER_NAMES = ["Red", "Green", "Yellow", "Blue"];
const START_POSITIONS = [0, 13, 26, 39]; // Starting positions on the main path
const HOME_STRETCH_STARTS = [50, 11, 24, 37]; // Where each player enters their home stretch

export const initializeLudoGame = (): LudoGameState => {
  return {
    players: PLAYER_COLORS.map((color, index) => ({
      color,
      name: PLAYER_NAMES[index],
      startPosition: START_POSITIONS[index],
      homeStretchStart: HOME_STRETCH_STARTS[index],
      pieces: Array(4).fill(null).map(() => ({
        position: -1,
        isHome: true,
        isFinished: false
      }))
    })),
    currentPlayer: 0,
    lastDiceRoll: 0,
    canRollAgain: false,
    moveCount: 0,
    winner: null
  };
};

export const rollDice = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

export const canMovePiece = (
  piece: LudoPiece,
  diceRoll: number,
  player: LudoPlayer
): boolean => {
  // Must roll 6 to leave home
  if (piece.isHome && diceRoll !== 6) return false;
  
  // Can't move finished pieces
  if (piece.isFinished) return false;
  
  // Can't move beyond finish
  if (!piece.isHome && piece.position >= 52) {
    const newPos = piece.position + diceRoll;
    if (newPos > 57) return false;
  }
  
  return true;
};

export const movePiece = (
  gameState: LudoGameState,
  playerIndex: number,
  pieceIndex: number,
  steps: number
): LudoGameState => {
  const newState = JSON.parse(JSON.stringify(gameState));
  const player = newState.players[playerIndex];
  const piece = player.pieces[pieceIndex];
  
  if (!canMovePiece(piece, steps, player)) {
    return gameState;
  }
  
  let canRollAgain = false;
  
  // Leaving home
  if (piece.isHome && steps === 6) {
    piece.isHome = false;
    piece.position = player.startPosition;
    canRollAgain = true;
  } 
  // Moving on board
  else if (!piece.isHome && !piece.isFinished) {
    let newPos = piece.position + steps;
    
    // Check if entering home stretch
    if (piece.position < 52) {
      // Normal board movement (0-51)
      newPos = newPos % 52;
      
      // Check if passing through home stretch entrance
      const distanceToHomeStretch = (player.homeStretchStart - piece.position + 52) % 52;
      if (steps >= distanceToHomeStretch && steps <= distanceToHomeStretch) {
        // Enter home stretch
        newPos = 52 + (steps - distanceToHomeStretch);
      }
    } else {
      // Already in home stretch (52-57)
      if (newPos >= 58) {
        // Can't overshoot finish
        return gameState;
      }
      if (newPos === 57) {
        piece.isFinished = true;
        canRollAgain = true;
      }
    }
    
    piece.position = newPos;
    
    // Check for capture (only on main board, not in home stretch)
    if (piece.position < 52) {
      newState.players.forEach((otherPlayer: LudoPlayer, otherPlayerIndex: number) => {
        if (otherPlayerIndex !== playerIndex) {
          otherPlayer.pieces.forEach((otherPiece: LudoPiece) => {
            if (!otherPiece.isHome && !otherPiece.isFinished && 
                otherPiece.position === piece.position && otherPiece.position < 52) {
              // Send captured piece back home
              otherPiece.position = -1;
              otherPiece.isHome = true;
              canRollAgain = true;
            }
          });
        }
      });
    }
  }
  
  // Check for winner
  const allFinished = player.pieces.every((p: LudoPiece) => p.isFinished);
  if (allFinished) {
    newState.winner = playerIndex;
  }
  
  // Update game state
  newState.canRollAgain = canRollAgain || steps === 6;
  if (!newState.canRollAgain) {
    newState.currentPlayer = (playerIndex + 1) % 4;
  }
  newState.lastDiceRoll = 0;
  newState.moveCount++;
  
  return newState;
};

export const getAvailableMoves = (
  gameState: LudoGameState,
  playerIndex: number
): number[] => {
  const player = gameState.players[playerIndex];
  const availablePieces: number[] = [];
  
  player.pieces.forEach((piece, index) => {
    if (canMovePiece(piece, gameState.lastDiceRoll, player)) {
      availablePieces.push(index);
    }
  });
  
  return availablePieces;
};
