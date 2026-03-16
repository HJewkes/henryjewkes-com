import { useState } from 'react'
import { Trophy, Sparkles, RotateCcw } from 'lucide-react'
import { BracketView } from '../../components/bracket/BracketView'
import { MascotBattle } from '../../components/bracket/MascotBattle'
import { useBracketState } from '../../hooks/useBracketState'

type Mode = 'bracket' | 'mascot'

const tabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
  { id: 'bracket', label: 'Bracket', icon: <Trophy size={18} /> },
  { id: 'mascot', label: 'Mascot Battle', icon: <Sparkles size={18} /> },
]

export default function BracketPage() {
  const [mode, setMode] = useState<Mode>('mascot')
  const { totalPicks, totalGames, clearPicks } = useBracketState()

  return (
    <div className="min-h-screen bg-background-base">
      <header className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <h1 className="font-heading text-lg font-bold text-text-primary leading-tight shrink-0">
            March Madness 2026
          </h1>

          {/* Center: picks progress */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-text-secondary whitespace-nowrap">
              <span className="font-bold text-text-primary">{totalPicks}</span>
              <span className="text-text-tertiary">/{totalGames}</span>
            </div>
            <div className="w-24 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary rounded-full transition-all duration-normal"
                style={{ width: `${(totalPicks / totalGames) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: tabs + reset */}
          <div className="flex items-center gap-2">
            <nav className="flex gap-1 bg-surface-elevated rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-fast
                    ${mode === tab.id
                      ? 'bg-brand-primary text-on-brand-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
            <button
              onClick={clearPicks}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-text-tertiary hover:text-status-error transition-colors rounded-md hover:bg-interactive-hover"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto">
        {mode === 'bracket' && <BracketView />}
        {mode === 'mascot' && <MascotBattle />}
      </main>
    </div>
  )
}
