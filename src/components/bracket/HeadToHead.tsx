import { useState, useMemo } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Share2, RotateCcw } from 'lucide-react'
import { useBracketState } from '../../hooks/useBracketState'
import type { Team } from '../../data/bracket2026'

const historicalSeedWinPct: Record<number, number> = {
  1: 99.3, 2: 93.8, 3: 85.1, 4: 79.2, 5: 64.6, 6: 62.5,
  7: 60.4, 8: 50.0, 9: 50.0, 10: 39.6, 11: 37.5,
  12: 35.4, 13: 20.8, 14: 14.9, 15: 6.3, 16: 0.7,
}

interface PendingMatchup {
  key: string
  top: Team
  bottom: Team
  round: string
  region: string
}

function ComparisonCard({
  team,
  side,
  onPick,
}: {
  team: Team
  side: 'left' | 'right'
  onPick: () => void
}) {
  const winPct = historicalSeedWinPct[team.seed] ?? 50

  return (
    <motion.button
      onClick={onPick}
      className="flex-1 bg-surface-elevated rounded-xl border border-border hover:border-brand-primary/50 transition-colors p-6 flex flex-col items-center text-center cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `#${team.color}20` }}
      >
        {team.logo ? (
          <img src={team.logo} alt="" className="w-14 h-14 object-contain" />
        ) : (
          <span className="text-3xl font-heading font-bold" style={{ color: `#${team.color}` }}>
            {team.seed}
          </span>
        )}
      </div>

      <div className="text-xs font-bold text-text-tertiary mb-1">#{team.seed} seed</div>
      <h3 className="font-heading text-xl font-bold text-text-primary mb-1">{team.name}</h3>
      <p className="text-sm text-text-secondary mb-4">{team.mascot}</p>

      <div className="w-full space-y-2 text-left">
        <StatRow label="Record" value={team.record} />
        <StatRow label="Conference" value={team.conference} />
        <StatRow label="Seed win rate" value={`${winPct}%`} />
        {team.rank && <StatRow label="AP Rank" value={`#${team.rank}`} />}
      </div>

      <div className="mt-4 px-4 py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        {side === 'left' ? '← Pick' : 'Pick →'}
      </div>
    </motion.button>
  )
}

function SwipeCard({
  matchup,
  onPick,
}: {
  matchup: PendingMatchup
  onPick: (team: Team) => void
}) {
  const [dragDir, setDragDir] = useState<'left' | 'right' | null>(null)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onPick(matchup.top)
    } else if (info.offset.x < -100) {
      onPick(matchup.bottom)
    }
    setDragDir(null)
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 40) setDragDir('right')
    else if (info.offset.x < -40) setDragDir('left')
    else setDragDir(null)
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="w-full max-w-sm mx-auto touch-pan-y"
    >
      <div className="bg-surface-elevated rounded-xl border border-border p-6 relative overflow-hidden">
        {/* Swipe indicators */}
        <AnimatePresence>
          {dragDir === 'right' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-status-success/10 flex items-center justify-center pointer-events-none"
            >
              <span className="text-4xl font-heading font-bold text-status-success rotate-[-15deg]">
                {matchup.top.name}
              </span>
            </motion.div>
          )}
          {dragDir === 'left' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-status-info/10 flex items-center justify-center pointer-events-none"
            >
              <span className="text-4xl font-heading font-bold text-status-info rotate-[15deg]">
                {matchup.bottom.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-4">
          <div className="text-xs text-text-tertiary">{matchup.region} — {matchup.round}</div>
        </div>

        <div className="flex items-center gap-4">
          {/* Left team */}
          <button
            onClick={() => onPick(matchup.top)}
            className="flex-1 flex flex-col items-center text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `#${matchup.top.color}20` }}
            >
              {matchup.top.logo && (
                <img src={matchup.top.logo} alt="" className="w-10 h-10 object-contain" />
              )}
            </div>
            <div className="text-[10px] font-bold text-text-tertiary">#{matchup.top.seed}</div>
            <div className="text-sm font-bold text-text-primary">{matchup.top.name}</div>
            <div className="text-xs text-text-secondary">{matchup.top.record}</div>
          </button>

          <div className="text-text-tertiary font-heading font-bold text-lg">VS</div>

          {/* Right team */}
          <button
            onClick={() => onPick(matchup.bottom)}
            className="flex-1 flex flex-col items-center text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: `#${matchup.bottom.color}20` }}
            >
              {matchup.bottom.logo && (
                <img src={matchup.bottom.logo} alt="" className="w-10 h-10 object-contain" />
              )}
            </div>
            <div className="text-[10px] font-bold text-text-tertiary">#{matchup.bottom.seed}</div>
            <div className="text-sm font-bold text-text-primary">{matchup.bottom.name}</div>
            <div className="text-xs text-text-secondary">{matchup.bottom.record}</div>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-tertiary">
          <ChevronLeft size={14} />
          <span>Swipe or tap to pick</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}

export function HeadToHead() {
  const state = useBracketState()
  const { bracket, picks, makePick, totalPicks, totalGames, getShareUrl, clearPicks } = state

  const allMatchups = useMemo(() => {
    const matchups: PendingMatchup[] = []
    const regionNames: Record<string, string> = {
      south: 'South', west: 'West', midwest: 'Midwest', east: 'East',
    }

    for (const [key, region] of Object.entries(bracket.regions)) {
      region.matchups.forEach((m, i) => {
        if (m.top && m.bottom) {
          matchups.push({
            key: `${key}-r1-${i}`,
            top: m.top,
            bottom: m.bottom,
            round: 'Round of 64',
            region: regionNames[key] ?? key,
          })
        }
      })
    }
    return matchups
  }, [bracket])

  const pendingMatchups = allMatchups.filter((m) => !picks[m.key])
  const currentMatchup = pendingMatchups[0]

  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640,
  )

  const handlePick = (team: Team) => {
    if (currentMatchup) {
      makePick(currentMatchup.key, team)
    }
  }

  const handleShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      prompt('Copy this link:', url)
    }
  }

  if (!currentMatchup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">🏀</div>
        <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
          Round of 64 Complete!
        </h2>
        <p className="text-text-secondary mb-6">
          Switch to Bracket view to continue with later rounds.
        </p>
        <div className="flex gap-3">
          <button
            onClick={clearPicks}
            className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-status-error border border-border rounded-lg hover:bg-interactive-hover transition-colors"
          >
            <RotateCcw size={16} />
            Start Over
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-primary text-on-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors"
          >
            <Share2 size={16} />
            Share Picks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Progress */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>{currentMatchup.region} — {currentMatchup.round}</span>
          <span>{totalPicks}/{totalGames} picks</span>
        </div>
        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-normal"
            style={{ width: `${(totalPicks / totalGames) * 100}%` }}
          />
        </div>
      </div>

      {/* Matchup display */}
      {isMobile ? (
        <SwipeCard matchup={currentMatchup} onPick={handlePick} />
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <span className="font-heading text-sm font-bold text-text-tertiary uppercase tracking-wider">
              {currentMatchup.region} — {currentMatchup.round}
            </span>
          </div>
          <div className="flex gap-4">
            <ComparisonCard team={currentMatchup.top} side="left" onPick={() => handlePick(currentMatchup.top)} />
            <div className="flex items-center">
              <span className="font-heading text-2xl font-bold text-text-tertiary">VS</span>
            </div>
            <ComparisonCard team={currentMatchup.bottom} side="right" onPick={() => handlePick(currentMatchup.bottom)} />
          </div>
        </div>
      )}
    </div>
  )
}
