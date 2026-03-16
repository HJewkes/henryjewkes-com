import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react'
import { BracketView } from '../../components/bracket/BracketView'
import { MascotBattle } from '../../components/bracket/MascotBattle'

type Mode = 'bracket' | 'mascot'

const tabs: { id: Mode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'bracket', label: 'Bracket', icon: <Trophy size={18} />, description: 'Classic bracket view' },
  { id: 'mascot', label: 'Mascot Battle', icon: <Sparkles size={18} />, description: 'Who wins in a fight?' },
]

export default function BracketPage() {
  const [mode, setMode] = useState<Mode>('mascot')

  return (
    <div className="min-h-screen bg-background-base">
      <header className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-heading text-lg font-bold text-text-primary leading-tight">
                March Madness 2026
              </h1>
              <p className="text-xs text-text-tertiary">Pick your bracket</p>
            </div>
          </div>

          <nav className="flex gap-1 bg-surface-elevated rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-fast
                  ${mode === tab.id
                    ? 'bg-brand-primary text-on-brand-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                  }
                `}
                title={tab.description}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto">
        {mode === 'bracket' && <BracketView />}
        {mode === 'mascot' && <MascotBattle />}
      </main>
    </div>
  )
}
