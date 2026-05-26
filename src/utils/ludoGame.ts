// Clean Ludo model.
// Each piece has `steps`: 0 = at home base, 1..51 = on main track (relative to player's start),
// 52..57 = home stretch squares, 57 = finished.
// Board position (for capture checks) = (player.startOffset + steps - 1) mod 52, only when 1 <= steps <= 51.

export interface LudoPiece {
  steps: number; // 0 home, 1..51 main path, 52..57 home stretch, 57 = finished
  isHome: boolean;
  isFinished: boolean;
}

export interface LudoPlayer {
  color: string;
  name: string;
  pieces: LudoPiece[];
  startOffset: number;
}

export interface LudoGameState {
  players: LudoPlayer[];
  currentPlayer: number;
  lastDiceRoll: number;
  canRollAgain: boolean;
  moveCount: number;
  winner: number | null;
}

const PLAYER_COLORS = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"];
const PLAYER_NAMES = ["Red", "Green", "Yellow", "Blue"];
const START_OFFSETS = [0, 13, 26, 39];

const FINISH_STEP = 57;

export const initializeLudoGame = (): LudoGameState => ({
  players: PLAYER_COLORS.map((color, index) => ({
    color,
    name: PLAYER_NAMES[index],
    startOffset: START_OFFSETS[index],
    pieces: Array(4)
      .fill(null)
      .map(() => ({ steps: 0, isHome: true, isFinished: false })),
  })),
  currentPlayer: 0,
  lastDiceRoll: 0,
  canRollAgain: false,
  moveCount: 0,
  winner: null,
});

export const rollDice = (): number => Math.floor(Math.random() * 6) + 1;

const getBoardPos = (player: LudoPlayer, piece: LudoPiece): number | null => {
  if (piece.isHome || piece.isFinished) return null;
  if (piece.steps < 1 || piece.steps > 51) return null;
  return (player.startOffset + piece.steps - 1) % 52;
};

export const canMovePiece = (piece: LudoPiece, diceRoll: number): boolean => {
  if (piece.isFinished) return false;
  if (piece.isHome) return diceRoll === 6;
  if (piece.steps + diceRoll > FINISH_STEP) return false;
  return true;
};

export const getAvailableMoves = (
  gameState: LudoGameState,
  playerIndex: number
): number[] => {
  const player = gameState.players[playerIndex];
  const out: number[] = [];
  player.pieces.forEach((p, i) => {
    if (canMovePiece(p, gameState.lastDiceRoll)) out.push(i);
  });
  return out;
};

export const movePiece = (
  gameState: LudoGameState,
  playerIndex: number,
  pieceIndex: number,
  steps: number
): LudoGameState => {
  const newState: LudoGameState = JSON.parse(JSON.stringify(gameState));
  const player = newState.players[playerIndex];
  const piece = player.pieces[pieceIndex];

  if (!canMovePiece(piece, steps)) return gameState;

  let bonusTurn = false;

  if (piece.isHome) {
    piece.isHome = false;
    piece.steps = 1;
    bonusTurn = true;
  } else {
    piece.steps += steps;
    if (piece.steps === FINISH_STEP) {
      piece.isFinished = true;
      bonusTurn = true;
    }
  }

  // Capture: if landed on main track on a non-safe square
  const landingPos = getBoardPos(player, piece);
  if (landingPos !== null) {
    newState.players.forEach((other, oi) => {
      if (oi === playerIndex) return;
      other.pieces.forEach((op) => {
        const opPos = getBoardPos(other, op);
        if (opPos === landingPos) {
          op.steps = 0;
          op.isHome = true;
          op.isFinished = false;
          bonusTurn = true;
        }
      });
    });
  }

  // Winner?
  if (player.pieces.every((p) => p.isFinished)) {
    newState.winner = playerIndex;
  }

  newState.canRollAgain = bonusTurn || steps === 6;
  if (!newState.canRollAgain) {
    newState.currentPlayer = (playerIndex + 1) % 4;
  }
  newState.lastDiceRoll = 0;
  newState.moveCount++;

  return newState;
};

export const pieceStatusLabel = (piece: LudoPiece): string => {
  if (piece.isFinished) return "🏁 Finished";
  if (piece.isHome) return "🏠 Home";
  if (piece.steps >= 52) return `Home stretch ${piece.steps - 51}/6`;
  return `Square ${piece.steps}/51`;
};
