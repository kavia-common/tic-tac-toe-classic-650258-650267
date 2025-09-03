import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import HelpOverlay from './components/HelpOverlay';

/**
 * Game types and helpers
 * The app supports:
 * - Player vs Player (PVP)
 * - Player vs AI (AI) with a simple heuristic AI
 * It features an interactive board, win/draw detection, score tracking,
 * and controls to start a new game and reset scores.
 */
type Player = 'X' | 'O';
type CellValue = Player | null;
type Board = CellValue[];

type GameMode = 'PVP' | 'AI';

type Score = {
  X: number;
  O: number;
  Draws: number;
};

const emptyBoard = (): Board => Array(9).fill(null);

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diags
];

function calculateWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

/**
/ PUBLIC_INTERFACE
 * chooseBestMove
 * A simple AI: try to win, block opponent, take center, take a corner, else any side.
 * Returns the index of the chosen move or null if not available.
 */
function chooseBestMove(board: Board, aiPlayer: Player): number | null {
  const human: Player = aiPlayer === 'X' ? 'O' : 'X';

  // Try all moves for a win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const test = [...board];
      test[i] = aiPlayer;
      if (calculateWinner(test)) return i;
    }
  }

  // Block the opponent's winning move
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const test = [...board];
      test[i] = human;
      if (calculateWinner(test)) return i;
    }
  }

  // Take center
  if (!board[4]) return 4;

  // Preferred corners
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // Any side
  const sides = [1, 3, 5, 7].filter((i) => !board[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return null;
}

/**
 * UI Components
 */

type CellProps = {
  index: number;
  value: CellValue;
  onPress: (index: number) => void;
  highlight?: boolean;
};

const Cell: React.FC<CellProps> = ({ index, value, onPress, highlight }) => {
  return (
    <Pressable
      onPress={() => onPress(index)}
      style={({ pressed }) => [
        styles.cell,
        highlight && styles.cellHighlight,
        pressed && styles.cellPressed,
      ]}
      android_ripple={{ color: '#e9ecef' }}
    >
      <Text style={[styles.cellText, value === 'X' ? styles.xText : styles.oText]}>
        {value ?? ''}
      </Text>
    </Pressable>
  );
};

type BoardViewProps = {
  board: Board;
  onCellPress: (idx: number) => void;
  winningLine?: number[] | null;
};

const BoardView: React.FC<BoardViewProps> = ({ board, onCellPress, winningLine }) => {
  const over = useMemo(() => {
    const w = calculateWinner(board);
    return !!w || isBoardFull(board);
  }, [board]);
  const handlePress = (idx: number) => {
    if (over) return;
    onCellPress(idx);
  };
  return (
    <View style={styles.board}>
      {board.map((value, idx) => (
        <Cell
          key={idx}
          index={idx}
          value={value}
          onPress={handlePress}
          highlight={winningLine?.includes(idx)}
        />
      ))}
    </View>
  );
};

type ModeToggleProps = {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
};

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange, disabled }) => {
  const options: { key: GameMode; label: string }[] = useMemo(
    () => [
      { key: 'PVP', label: 'Player vs Player' },
      { key: 'AI', label: 'Player vs AI' },
    ],
    [],
  );

  return (
    <View style={styles.modeContainer}>
      {options.map((opt) => {
        const selected = mode === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={({ pressed }) => [
              styles.modeButton,
              selected && styles.modeButtonActive,
              pressed && styles.pressed,
              disabled && styles.modeButtonDisabled,
            ]}
            disabled={disabled}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.modeText, selected && styles.modeTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

type ScoreBoardProps = {
  score: Score;
};

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score }) => {
  const items = [
    { key: 'X', label: 'X Wins', value: score.X },
    { key: 'O', label: 'O Wins', value: score.O },
    { key: 'D', label: 'Draws', value: score.Draws },
  ];
  return (
    <View style={styles.scoreRow}>
      <FlatList
        data={items}
        horizontal
        scrollEnabled={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>{item.label}</Text>
            <Text style={styles.scoreValue}>{item.value}</Text>
          </View>
        )}
      />
    </View>
  );
};

/**
/ PUBLIC_INTERFACE
 * App
 * Main entrypoint: renders the Tic Tac Toe game with PVP/AI modes, score tracking,
 * new game and reset controls, and a mobile-friendly UI.
 * Returns:
 *  - SafeAreaView containing controls, score board, board, and status text.
 */
export default function App() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [mode, setMode] = useState<GameMode>('AI');
  const [result, setResult] = useState<{ winner?: Player; draw?: boolean; line?: number[] } | null>(null);
  const [score, setScore] = useState<Score>({ X: 0, O: 0, Draws: 0 });
  const [aiPlaysAs, setAiPlaysAs] = useState<Player>('O');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const winnerInfo = useMemo(() => calculateWinner(board), [board]);

  const statusText = useMemo(() => {
    if (winnerInfo) {
      return `Winner: ${winnerInfo.winner}`;
    }
    if (isBoardFull(board)) {
      return 'Draw';
    }
    return `Turn: ${currentPlayer}`;
  }, [board, currentPlayer, winnerInfo]);

  const isGameOver = !!winnerInfo || isBoardFull(board);

  const handleCellPress = useCallback(
    (idx: number) => {
      if (board[idx] || isGameOver) return;
      // Block input if AI's turn
      if (mode === 'AI' && currentPlayer === aiPlaysAs) return;

      const next = [...board];
      next[idx] = currentPlayer;
      setBoard(next);
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    },
    [board, currentPlayer, isGameOver, mode, aiPlaysAs],
  );

  const applyResultIfAny = useCallback(
    (b: Board) => {
      const w = calculateWinner(b);
      if (w) {
        setResult({ winner: w.winner, line: w.line });
        setScore((prev) => ({ ...prev, [w.winner]: prev[w.winner] + 1 }));
        return true;
      }
      if (isBoardFull(b)) {
        setResult({ draw: true });
        setScore((prev) => ({ ...prev, Draws: prev.Draws + 1 }));
        return true;
      }
      return false;
    },
    [],
  );

  // When mode is AI and it's AI's turn, perform a move
  useEffect(() => {
    if (mode !== 'AI') return;
    if (isGameOver) return;
    if (currentPlayer !== aiPlaysAs) return;

    const timer = setTimeout(() => {
      const move = chooseBestMove(board, aiPlaysAs);
      if (move === null) return;
      const next = [...board];
      if (!next[move]) {
        next[move] = aiPlaysAs;
        setBoard(next);
        setCurrentPlayer(aiPlaysAs === 'X' ? 'O' : 'X');
      }
    }, 350); // small delay for better UX

    return () => clearTimeout(timer);
  }, [mode, currentPlayer, aiPlaysAs, board, isGameOver]);

  // Check for result after every change to board
  useEffect(() => {
    // If a new game started and result is stale, allow recalculation.
    if (result?.winner === undefined && !result?.draw) {
      // no terminal result stored, continue to evaluate
    } else if (result) {
      return; // already decided
    }
    applyResultIfAny(board);
  }, [board, applyResultIfAny, result]);

  const startNewGame = useCallback(() => {
    setBoard(emptyBoard());
    setResult(null);
    setCurrentPlayer('X');
    // For AI mode, let the AI optionally start if set to X
    if (mode === 'AI' && aiPlaysAs === 'X') {
      // AI will move automatically via effect
    }
  }, [mode, aiPlaysAs]);

  const resetAll = useCallback(() => {
    setBoard(emptyBoard());
    setResult(null);
    setCurrentPlayer('X');
    setScore({ X: 0, O: 0, Draws: 0 });
  }, []);

  const switchMode = useCallback(
    (m: GameMode) => {
      setMode(m);
      // Reset game state when switching mode
      setBoard(emptyBoard());
      setResult(null);
      setCurrentPlayer('X');
    },
    [],
  );

  const toggleAiSide = useCallback(() => {
    setAiPlaysAs((p) => (p === 'X' ? 'O' : 'X'));
    // Reset board so new side applies immediately
    setBoard(emptyBoard());
    setResult(null);
    setCurrentPlayer('X');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={Platform.OS === 'android' ? 'light' : 'auto'} />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Tic Tac Toe</Text>
          <Pressable
            style={({ pressed }) => [styles.helpBtn, pressed && styles.pressed]}
            onPress={() => setShowHelp(true)}
            accessibilityRole="button"
            accessibilityLabel="Open help"
          >
            <Text style={styles.helpBtnText}>?</Text>
          </Pressable>
        </View>

        <ModeToggle mode={mode} onChange={switchMode} disabled={!isGameOver && board.some(Boolean)} />

        {mode === 'AI' && (
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>AI plays as:</Text>
            <Pressable
              style={({ pressed }) => [styles.aiButton, pressed && styles.pressed]}
              onPress={toggleAiSide}
            >
              <Text style={[styles.aiText, aiPlaysAs === 'X' ? styles.xText : styles.oText]}>
                {aiPlaysAs}
              </Text>
            </Pressable>
          </View>
        )}

        <ScoreBoard score={score} />

        <View style={styles.statusRow}>
          <Text
            style={[
              styles.statusText,
              winnerInfo?.winner === 'X' || currentPlayer === 'X' ? styles.xText : styles.oText,
            ]}
          >
            {statusText}
          </Text>
        </View>

        <BoardView
          board={board}
          onCellPress={handleCellPress}
          winningLine={winnerInfo?.line ?? null}
        />

        <View style={styles.controls}>
          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={startNewGame}>
            <Text style={styles.primaryBtnText}>New Game</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]} onPress={resetAll}>
            <Text style={styles.secondaryBtnText}>Reset Scores</Text>
          </Pressable>
        </View>

        <Text style={styles.footerHint}>
          Tip: In AI mode, tap &quot;AI plays as&quot; to toggle who starts.
        </Text>
        <HelpOverlay visible={showHelp} onClose={() => setShowHelp(false)} />
      </View>
    </SafeAreaView>
  );
}

const BOARD_SIZE = 300;
const CELL_SIZE = BOARD_SIZE / 3 - 8;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  container: {
    flex: 1,
    paddingTop: 12,
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  headerRow: {
    width: '100%',
    maxWidth: BOARD_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc', // slate-50
    marginVertical: 12,
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBtnText: {
    color: '#e2e8f0',
    fontWeight: '900',
    fontSize: 18,
    top: -1,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155', // slate-700
    backgroundColor: '#111827', // gray-900
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonActive: {
    backgroundColor: '#1f2937', // gray-800
    borderColor: '#60a5fa', // blue-400
  },
  modeText: {
    color: '#cbd5e1', // slate-300
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#e2e8f0', // slate-200
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  aiLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  aiButton: {
    backgroundColor: '#111827',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aiText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
  },
  scoreRow: {
    marginTop: 16,
    marginBottom: 4,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginHorizontal: 4,
    gap: 8,
  },
  scoreLabel: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  scoreValue: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 14,
  },
  statusRow: {
    marginTop: 10,
    marginBottom: 12,
    minHeight: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    backgroundColor: '#0b1220',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1f2a44',
  },
  cellHighlight: {
    borderColor: '#22c55e', // green-500
    backgroundColor: '#0b1a12',
  },
  cellPressed: {
    opacity: 0.9,
  },
  cellText: {
    fontSize: 48,
    fontWeight: '900',
  },
  xText: {
    color: '#60a5fa', // blue-400
  },
  oText: {
    color: '#f472b6', // pink-400
  },
  controls: {
    marginTop: 16,
    gap: 10,
    width: BOARD_SIZE,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.9,
  },
  footerHint: {
    marginTop: 14,
    color: '#64748b', // slate-500
    fontSize: 12,
  },
});
