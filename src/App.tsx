
import { useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import {
  RotateCcw,
  Undo2,
  Crown,
  UsersRound,
  Trophy,
  ShieldCheck,
  Zap,
  Menu,
  ChevronRight,
} from 'lucide-react';
import './App.css';

type MoveRecord = {
  san: string;
  from: Square;
  to: Square;
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const pieceSymbols: Record<string, string> = {
  wk: '♔',
  wq: '♕',
  wr: '♖',
  wb: '♗',
  wn: '♘',
  wp: '♙',
  bk: '♚',
  bq: '♛',
  br: '♜',
  bb: '♝',
  bn: '♞',
  bp: '♟︎',
};

function App() {
  const [positions, setPositions] = useState<string[]>([
    new Chess().fen(),
  ]);
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);

  const fen = positions[positions.length - 1];
  const game = useMemo(() => new Chess(fen), [fen]);

  const legalTargets = useMemo(() => {
    if (!selected) return [];

    return game
      .moves({ square: selected, verbose: true })
      .map((move) => move.to);
  }, [game, selected]);

  const lastMove = moves[moves.length - 1];

  const status = game.isCheckmate()
    ? `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`
    : game.isStalemate()
      ? 'Draw — stalemate'
      : game.isDraw()
        ? 'Draw — game over'
        : game.isCheck()
          ? `${game.turn() === 'w' ? 'White' : 'Black'} is in check`
          : `${game.turn() === 'w' ? 'White' : 'Black'} to move`;

  function handleSquareClick(square: Square) {
    if (game.isGameOver()) return;

    const piece = game.get(square);

    if (selected && legalTargets.includes(square)) {
      const nextGame = new Chess(fen);

      try {
        const move = nextGame.move({
          from: selected,
          to: square,
          promotion: 'q',
        });

        setPositions([...positions, nextGame.fen()]);
        setMoves([
          ...moves,
          { san: move.san, from: move.from, to: move.to },
        ]);
        setSelected(null);
        return;
      } catch {
        setSelected(null);
        return;
      }
    }

    if (piece && piece.color === game.turn()) {
      setSelected(square);
    } else {
      setSelected(null);
    }
  }

  function undoMove() {
    if (positions.length <= 1) return;

    setPositions(positions.slice(0, -1));
    setMoves(moves.slice(0, -1));
    setSelected(null);
  }

  function restartGame() {
    setPositions([new Chess().fen()]);
    setMoves([]);
    setSelected(null);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Knightly home">
          <span className="brand-mark">
            <Crown size={25} />
          </span>
          <span>
            <strong>Knightly</strong>
            <small>CHESS ARENA</small>
          </span>
        </a>

        <div className="side-label">PLAY</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#play">
            <Zap size={19} /> Play Chess
          </a>
          <a className="nav-item" href="#players">
            <UsersRound size={19} /> Players
          </a>
          <a className="nav-item" href="#leaderboard">
            <Trophy size={19} /> Leaderboard
          </a>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-icon">
            <ShieldCheck size={20} />
          </div>
          <strong>Your next move matters.</strong>
          <p>Practice, learn, and improve one game at a time.</p>
        </div>

        <div className="sidebar-footer">
          <span className="online-dot" />
          Local game ready
        </div>
      </aside>

      <section className="main-panel" id="home">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open menu"
            type="button"
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Play <ChevronRight size={15} /> <strong>Classic Chess</strong>
          </div>
          <div className="topbar-right">
            <span className="mode-pill">
              <span className="online-dot" /> Local mode
            </span>
            <div className="avatar">P</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR ARENA, YOUR STRATEGY</p>
              <h1>Make your move.</h1>
              <p className="subtitle">
                Every great player starts with a single move.
              </p>
            </div>
            <div className="rank-card">
              <span className="rank-icon">
                <Trophy size={21} />
              </span>
              <span>
                <small>TRAINING MODE</small>
                <strong>Classic Chess</strong>
              </span>
            </div>
          </section>

          <section className="game-layout" id="play">
            <div className="board-column">
              <div className="player-bar">
                <div className="player-avatar black-avatar">♟</div>
                <div className="player-info">
                  <strong>Black Player</strong>
                  <span>Local opponent</span>
                </div>
                <span className="player-tag">BLACK</span>
              </div>

              <div className="board-frame">
                <div className="chessboard" role="group" aria-label="Chessboard">
                  {Array.from({ length: 64 }, (_, index) => {
                    const row = Math.floor(index / 8);
                    const col = index % 8;
                    const rank = 8 - row;
                    const square = `${files[col]}${rank}` as Square;
                    const piece = game.get(square);
                    const pieceKey = piece
                      ? `${piece.color}${piece.type}`
                      : '';
                    const isLight = (row + col) % 2 === 0;
                    const isSelected = selected === square;
                    const isTarget = legalTargets.includes(square);
                    const isLastMove =
                      lastMove?.from === square || lastMove?.to === square;

                    return (
                      <button
                        key={square}
                        type="button"
                        className={[
                          'square',
                          isLight ? 'light-square' : 'dark-square',
                          isSelected ? 'selected-square' : '',
                          isLastMove ? 'last-move-square' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-label={`${square}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
                        onClick={() => handleSquareClick(square)}
                      >
                        {col === 0 && (
                          <span className="rank-label">{rank}</span>
                        )}
                        {row === 7 && (
                          <span className="file-label">{files[col]}</span>
                        )}

                        {isTarget && !piece && (
                          <span className="move-dot" />
                        )}

                        {isTarget && piece && (
                          <span className="capture-ring" />
                        )}

                        {piece && (
                          <span
                            className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}
                          >
                            {pieceSymbols[pieceKey]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="player-bar bottom-player">
                <div className="player-avatar white-avatar">♙</div>
                <div className="player-info">
                  <strong>You</strong>
                  <span>White pieces</span>
                </div>
                <span className="player-tag">WHITE</span>
              </div>

              <p className="board-hint">
                Select a piece, then select a highlighted destination.
                Promotions automatically become queens.
              </p>
            </div>

            <aside className="game-sidebar">
              <div className="panel-card game-status-card">
                <div className="panel-heading">
                  <span className="status-indicator" />
                  <h2>Game status</h2>
                </div>
                <p className="status-text">{status}</p>
                <p className="status-caption">
                  {game.isGameOver()
                    ? 'Start a new game whenever you are ready.'
                    : 'Play at your own pace. Think before you move.'}
                </p>
                <div className="status-divider" />
                <div className="status-stats">
                  <div>
                    <span>Moves played</span>
                    <strong>{moves.length}</strong>
                  </div>
                  <div>
                    <span>Turn</span>
                    <strong>{game.turn() === 'w' ? 'White' : 'Black'}</strong>
                  </div>
                </div>
              </div>

              <div className="panel-card moves-card">
                <div className="panel-heading moves-heading">
                  <h2>Move history</h2>
                  <span className="move-count">{moves.length}</span>
                </div>

                {moves.length === 0 ? (
                  <div className="empty-moves">
                    <div className="empty-icon">
                      <Crown size={23} />
                    </div>
                    <strong>Your game starts here</strong>
                    <p>Your moves will appear here as you play.</p>
                  </div>
                ) : (
                  <div className="move-list">
                    {Array.from(
                      { length: Math.ceil(moves.length / 2) },
                      (_, row) => {
                        const whiteMove = moves[row * 2];
                        const blackMove = moves[row * 2 + 1];

                        return (
                          <div className="move-row" key={row}>
                            <span className="move-number">{row + 1}.</span>
                            <span>{whiteMove?.san}</span>
                            <span>{blackMove?.san ?? '…'}</span>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}

                <div className="move-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={undoMove}
                    disabled={moves.length === 0}
                  >
                    <Undo2 size={17} /> Undo
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={restartGame}
                  >
                    <RotateCcw size={17} /> New game
                  </button>
                </div>
              </div>

              <div className="tip-card">
                <div className="tip-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <strong>Strategy tip</strong>
                  <p>Control the center and develop your pieces early.</p>
                </div>
              </div>
            </aside>
          </section>

          <footer className="app-footer">
            <span>KNIGHTLY · CHESS ARENA</span>
            <span>Built for thoughtful play.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default App;
