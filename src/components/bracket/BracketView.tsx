import { useState, useEffect, useMemo } from 'react'
import { Share2, RotateCcw, Info } from 'lucide-react'
import {
  Bracket,
  Seed,
  SeedItem,
  SeedTeam,
  type IRenderSeedProps,
  type IRoundProps,
} from 'react-brackets'
import { useBracketState } from '../../hooks/useBracketState'
import type { Team } from '../../data/bracket2026'
import { TeamDetailPanel } from './TeamDetailPanel'

function useWindowWidth() {
  const [w, setW] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

interface PickContext {
  makePick: (key: string, team: Team) => void
  getWinner: (key: string) => Team | undefined
  onInspect: (team: Team) => void
  mobileBreakpoint: number
}

function TeamRow({ team, matchupKey, ctx }: { team: Team | undefined; matchupKey: string; ctx: PickContext }) {
  const winner = ctx.getWinner(matchupKey)
  const isWinner = team && winner?.name === team.name

  return (
    <SeedTeam
      style={{
        backgroundColor: isWinner ? 'rgba(255, 121, 0, 0.15)' : '#1C1C1C',
        borderColor: isWinner ? '#FF7900' : 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        padding: '5px 8px',
        cursor: team ? 'pointer' : 'default',
        fontSize: 12,
        minWidth: 150,
      }}
      onClick={() => team && ctx.makePick(matchupKey, team)}
    >
      {team ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', width: 16, textAlign: 'center', flexShrink: 0 }}>
            {team.seed}
          </span>
          {team.logo && (
            <img src={team.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {team.name}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); ctx.onInspect(team) }}
            style={{ opacity: 0.3, cursor: 'pointer', flexShrink: 0, background: 'none', border: 'none', color: 'inherit', padding: 0 }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.3' }}
          >
            <Info size={10} />
          </button>
        </div>
      ) : (
        <span style={{ color: '#4B5563', fontSize: 11 }}>TBD</span>
      )}
    </SeedTeam>
  )
}

function CustomSeed({ seed }: IRenderSeedProps) {
  const ctx = (seed as any).__ctx as PickContext
  const matchupKey = (seed as any).__key as string
  const top = (seed as any).__top as Team | undefined
  const bottom = (seed as any).__bottom as Team | undefined

  return (
    <Seed mobileBreakpoint={ctx.mobileBreakpoint}>
      <SeedItem style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0 }}>
        <div>
          <TeamRow team={top} matchupKey={matchupKey} ctx={ctx} />
          <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />
          <TeamRow team={bottom} matchupKey={matchupKey} ctx={ctx} />
        </div>
      </SeedItem>
    </Seed>
  )
}

function buildRounds(
  regionKey: string,
  state: ReturnType<typeof useBracketState>,
  ctx: PickContext,
): IRoundProps[] {
  const { getMatchups, getRound2Matchups, getSweet16Matchups, getElite8Matchup } = state

  const r1 = getMatchups(regionKey)
  const r2 = getRound2Matchups(regionKey)
  const s16 = getSweet16Matchups(regionKey)
  const e8 = getElite8Matchup(regionKey)

  function toSeeds(matchups: { key: string; top: Team | undefined; bottom: Team | undefined }[]) {
    return matchups.map((m, i) => ({
      id: i,
      teams: [{ name: m.top?.name ?? 'TBD' }, { name: m.bottom?.name ?? 'TBD' }],
      __key: m.key,
      __top: m.top,
      __bottom: m.bottom,
      __ctx: ctx,
    }))
  }

  const r1Data = r1.map((m, i) => ({
    key: `${regionKey}-r1-${i}`,
    top: m.top ?? undefined,
    bottom: m.bottom ?? undefined,
  }))

  return [
    { title: '', seeds: toSeeds(r1Data) },
    { title: '', seeds: toSeeds(r2) },
    { title: '', seeds: toSeeds(s16) },
    { title: '', seeds: toSeeds([e8]) },
  ]
}

function RegionBracket({
  regionKey,
  label,
  state,
  ctx,
}: {
  regionKey: string
  label: string
  state: ReturnType<typeof useBracketState>
  ctx: PickContext
}) {
  const rounds = buildRounds(regionKey, state, ctx)

  return (
    <div>
      <h3 className="font-heading text-xs font-bold text-brand-primary mb-1">
        {label}
      </h3>
      <Bracket
        rounds={rounds}
        rtl={false}
        renderSeedComponent={CustomSeed}
        mobileBreakpoint={ctx.mobileBreakpoint}
        roundTitleComponent={() => <div />}
      />
    </div>
  )
}

function FinalFourSection({
  state,
  ctx,
}: {
  state: ReturnType<typeof useBracketState>
  ctx: PickContext
}) {
  const { getFinalFourMatchups, getChampionship, getWinner } = state
  const ffMatchups = getFinalFourMatchups()
  const ff0 = ffMatchups[0] ?? { key: 'ff-0', top: undefined, bottom: undefined }
  const ff1 = ffMatchups[1] ?? { key: 'ff-1', top: undefined, bottom: undefined }
  const championship = getChampionship()
  const champion = getWinner('championship')

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div>
        <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider text-center mb-2">
          Final Four
        </div>
        <div className="flex flex-col gap-6">
          {[ff0, ff1].map((ff) => (
            <div key={ff.key} className="min-w-[180px]">
              <TeamRow team={ff.top} matchupKey={ff.key} ctx={ctx} />
              <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />
              <TeamRow team={ff.bottom} matchupKey={ff.key} ctx={ctx} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold text-brand-primary uppercase tracking-wider text-center mb-2">
          Championship
        </div>
        <div className="min-w-[180px]">
          <TeamRow team={championship.top} matchupKey="championship" ctx={ctx} />
          <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />
          <TeamRow team={championship.bottom} matchupKey="championship" ctx={ctx} />
        </div>
        {champion && (
          <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-brand-primary/20 border border-brand-primary rounded-lg animate-fade-in">
            {champion.logo && <img src={champion.logo} alt="" className="w-6 h-6 object-contain" />}
            <div className="text-center">
              <div className="text-xs font-bold text-text-primary">{champion.name}</div>
              <div className="text-[10px] text-text-tertiary">{champion.mascot}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

type TabId = 'south-midwest' | 'west-east' | 'final-four' | 'south' | 'midwest' | 'west' | 'east'

interface TabDef {
  id: TabId
  label: string
  mobileOnly?: boolean
  desktopOnly?: boolean
}

const ALL_TABS: TabDef[] = [
  { id: 'south-midwest', label: 'South + Midwest', desktopOnly: true },
  { id: 'west-east', label: 'West + East', desktopOnly: true },
  { id: 'south', label: 'South', mobileOnly: true },
  { id: 'midwest', label: 'Midwest', mobileOnly: true },
  { id: 'west', label: 'West', mobileOnly: true },
  { id: 'east', label: 'East', mobileOnly: true },
  { id: 'final-four', label: 'Final Four' },
]

export function BracketView() {
  const state = useBracketState()
  const [inspectedTeam, setInspectedTeam] = useState<Team | null>(null)
  const [copied, setCopied] = useState(false)
  const { makePick, getWinner, totalPicks, totalGames, getShareUrl, clearPicks } = state
  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600

  const [activeTab, setActiveTab] = useState<TabId>(isMobile ? 'south' : 'south-midwest')

  useEffect(() => {
    setActiveTab(isMobile ? 'south' : 'south-midwest')
  }, [isMobile])

  const tabs = useMemo(
    () => ALL_TABS.filter((t) => {
      if (isMobile && t.desktopOnly) return false
      if (!isMobile && t.mobileOnly) return false
      return true
    }),
    [isMobile],
  )

  const ctx: PickContext = {
    makePick,
    getWinner,
    onInspect: setInspectedTeam,
    mobileBreakpoint: 0,
  }

  const handleShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy this link:', url)
    }
  }

  const isComplete = totalPicks === totalGames

  const regionLabel = (key: string) =>
    `${state.bracket.regions[key]?.name} — ${state.bracket.regions[key]?.city}`

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="sticky top-[57px] z-40 bg-surface-base/80 backdrop-blur-md border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-text-secondary">
            <span className="font-bold text-text-primary">{totalPicks}</span>
            <span className="text-text-tertiary">/{totalGames} picks</span>
          </div>
          <div className="w-32 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-normal"
              style={{ width: `${(totalPicks / totalGames) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearPicks} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-tertiary hover:text-status-error transition-colors rounded-md hover:bg-interactive-hover">
            <RotateCcw size={14} /> Reset
          </button>
          {isComplete && (
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-primary text-on-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors">
              <Share2 size={14} /> {copied ? 'Link Copied!' : 'Share'}
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-brand-primary border-brand-primary'
                  : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-4 overflow-x-auto">
        {activeTab === 'south-midwest' && (
          <div className="flex flex-col gap-8">
            <RegionBracket regionKey="south" label={regionLabel('south')} state={state} ctx={ctx} />
            <RegionBracket regionKey="midwest" label={regionLabel('midwest')} state={state} ctx={ctx} />
          </div>
        )}
        {activeTab === 'west-east' && (
          <div className="flex flex-col gap-8">
            <RegionBracket regionKey="west" label={regionLabel('west')} state={state} ctx={ctx} />
            <RegionBracket regionKey="east" label={regionLabel('east')} state={state} ctx={ctx} />
          </div>
        )}
        {activeTab === 'south' && (
          <RegionBracket regionKey="south" label={regionLabel('south')} state={state} ctx={ctx} />
        )}
        {activeTab === 'midwest' && (
          <RegionBracket regionKey="midwest" label={regionLabel('midwest')} state={state} ctx={ctx} />
        )}
        {activeTab === 'west' && (
          <RegionBracket regionKey="west" label={regionLabel('west')} state={state} ctx={ctx} />
        )}
        {activeTab === 'east' && (
          <RegionBracket regionKey="east" label={regionLabel('east')} state={state} ctx={ctx} />
        )}
        {activeTab === 'final-four' && (
          <FinalFourSection state={state} ctx={ctx} />
        )}
      </div>

      {inspectedTeam && (
        <TeamDetailPanel team={inspectedTeam} onClose={() => setInspectedTeam(null)} />
      )}
    </div>
  )
}
