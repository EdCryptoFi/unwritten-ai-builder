import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  History, 
  TrendingUp, 
  Users, 
  Filter, 
  ArrowRight, 
  Plus, 
  Info,
  Calendar,
  Receipt,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

type RuleStatus = 'observed' | 'ratified' | 'drifting';

interface RuleVersion {
  version: string;
  note: string;
  date: string;
}

interface SpendingRule {
  id: string;
  sentence: string;
  category: string;
  status: RuleStatus;
  confidence: number; // 0 to 100
  evidenceCount: number;
  introducedWeek: number;
  activeWeeks: number[];
  versionChain: RuleVersion[];
  discoveredImpact: string;
  member: string;
}

const ALL_RULES: SpendingRule[] = [
  {
    id: 'r1',
    sentence: 'Coffee and morning pastries exceed $45 weekly whenever school holidays begin.',
    category: 'Groceries & Dining',
    status: 'ratified',
    confidence: 94,
    evidenceCount: 28,
    introducedWeek: 1,
    activeWeeks: [1, 2, 3, 4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Estimated as generic coffee run habit', date: 'Week 1' },
      { version: 'v2', note: 'Isolated correlation with school holiday calendar', date: 'Week 3' }
    ],
    discoveredImpact: '+$180/mo shift',
    member: 'Household'
  },
  {
    id: 'r2',
    sentence: 'Weekend grocery runs at Trader Joe’s consistently spike by 35% when planned past 6:00 PM.',
    category: 'Groceries',
    status: 'observed',
    confidence: 82,
    evidenceCount: 14,
    introducedWeek: 1,
    activeWeeks: [1, 2, 3, 4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Identified late-evening impulse basket size', date: 'Week 1' }
    ],
    discoveredImpact: '+$65/basket',
    member: 'Alex & Sam'
  },
  {
    id: 'r3',
    sentence: 'Streaming and software subscriptions drift upward by $12–$25 each quarter without explicit approval.',
    category: 'Subscriptions',
    status: 'drifting',
    confidence: 76,
    evidenceCount: 9,
    introducedWeek: 2,
    activeWeeks: [2, 3, 4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Logged baseline streaming tiers', date: 'Week 2' },
      { version: 'v2', note: 'Detected unbudgeted cloud storage add-on', date: 'Week 4' },
      { version: 'v3', note: 'Drifting beyond agreed $60 cap', date: 'Week 5' }
    ],
    discoveredImpact: '+$39 creep',
    member: 'Household'
  },
  {
    id: 'r4',
    sentence: 'Fuel fills occur every Thursday evening regardless of actual tank level before weekend getaways.',
    category: 'Transportation',
    status: 'ratified',
    confidence: 91,
    evidenceCount: 22,
    introducedWeek: 2,
    activeWeeks: [2, 3, 4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Observed repeated Thursday pump charges', date: 'Week 2' },
      { version: 'v2', note: 'Ratified by family as intentional prep ritual', date: 'Week 3' }
    ],
    discoveredImpact: '$70 fixed weekly',
    member: 'Alex'
  },
  {
    id: 'r5',
    sentence: 'Friday takeout choices exceed budget when neither adult logs dinner plans by 3:00 PM.',
    category: 'Dining Out',
    status: 'observed',
    confidence: 88,
    evidenceCount: 16,
    introducedWeek: 3,
    activeWeeks: [3, 4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Unplanned convenience ordering pattern', date: 'Week 3' },
      { version: 'v2', note: 'Time correlation confirmed at 3 PM cutoff', date: 'Week 4' }
    ],
    discoveredImpact: '+$40 per Friday',
    member: 'Household'
  },
  {
    id: 'r6',
    sentence: 'Pharmacy and wellness spending clustered in week 4 dropped 40% after shifting vitamins to recurring deliveries.',
    category: 'Health & Care',
    status: 'ratified',
    confidence: 96,
    evidenceCount: 31,
    introducedWeek: 4,
    activeWeeks: [4, 5, 6],
    versionChain: [
      { version: 'v1', note: 'Identified ad-hoc pharmacy markups', date: 'Week 4' },
      { version: 'v2', note: 'Converted to batch order', date: 'Week 5' }
    ],
    discoveredImpact: '-$55/mo saved',
    member: 'Sam'
  },
  {
    id: 'r7',
    sentence: 'Home maintenance micro-purchases at hardware stores diverge from the seasonal sinking fund.',
    category: 'Home & Yard',
    status: 'drifting',
    confidence: 68,
    evidenceCount: 7,
    introducedWeek: 5,
    activeWeeks: [5, 6],
    versionChain: [
      { version: 'v1', note: 'Initial surge of garden supplies', date: 'Week 5' },
      { version: 'v2', note: 'Paced 1.8x higher than agreed buffer', date: 'Week 6' }
    ],
    discoveredImpact: '+$140 unallocated',
    member: 'Household'
  },
  {
    id: 'r8',
    sentence: 'Utility charges fluctuate within predictable 8% bands based on automated thermostat scheduling.',
    category: 'Utilities',
    status: 'ratified',
    confidence: 98,
    evidenceCount: 42,
    introducedWeek: 6,
    activeWeeks: [6],
    versionChain: [
      { version: 'v1', note: 'Validated smart-meter consumption baseline', date: 'Week 6' }
    ],
    discoveredImpact: 'Stable baseline',
    member: 'Household'
  }
];

export function App() {
  const [selectedWeek, setSelectedWeek] = useState<number>(6);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Filter rules active in the chosen week
  const activeRulesForWeek = ALL_RULES.filter(rule => 
    rule.activeWeeks.includes(selectedWeek) &&
    (statusFilter === 'all' || rule.status === statusFilter)
  );

  const getStatusBadge = (status: RuleStatus) => {
    switch (status) {
      case 'ratified':
        return (
          <span className="inline-flex items-center gap-xs rounded-full border border-utility-success-200 bg-utility-success-50 px-md py-xxs text-xs font-medium text-utility-success-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-fg-success-primary shrink-0" />
            ratified
          </span>
        );
      case 'drifting':
        return (
          <span className="inline-flex items-center gap-xs rounded-full border border-utility-warning-200 bg-utility-warning-50 px-md py-xxs text-xs font-medium text-utility-warning-700">
            <AlertTriangle className="w-3.5 h-3.5 text-fg-warning-primary shrink-0" />
            drifting
          </span>
        );
      case 'observed':
      default:
        return (
          <span className="inline-flex items-center gap-xs rounded-full border border-utility-brand-200 bg-utility-brand-50 px-md py-xxs text-xs font-medium text-utility-brand-700">
            <Eye className="w-3.5 h-3.5 text-fg-brand-primary shrink-0" />
            observed
          </span>
        );
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'bg-success-primary';
    if (conf >= 75) return 'bg-brand-solid';
    return 'bg-warning-primary';
  };

  return (
    <div className="min-h-screen bg-primary text-primary pb-32">
      {/* Top Header */}
      <header className="border-b border-secondary bg-secondary">
        <div className="max-w-[960px] mx-auto px-xl py-lg flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-9 h-9 rounded-md bg-brand-solid flex items-center justify-center text-primary-on-brand shadow-xs">
              <Sparkles className="w-5 h-5 text-fg-white shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-sm">
                <h1 className="text-heading-sm font-semibold text-primary tracking-tight">Unwritten</h1>
                <span className="text-xs px-xs py-xxs rounded-sm bg-tertiary text-tertiary font-mono">v2.4</span>
              </div>
              <p className="text-xs text-secondary">Household spending rules discovered from live habits</p>
            </div>
          </div>

          <div className="flex items-center gap-md">
            <div className="flex items-center gap-xs text-xs text-secondary bg-primary px-md py-xs rounded-md border border-secondary">
              <Users className="w-3.5 h-3.5 text-fg-quaternary shrink-0" />
              <span>Miller-Chen Home</span>
            </div>
            <button className="inline-flex items-center gap-sm rounded-lg border border-transparent bg-brand-solid px-lg py-sm text-sm font-semibold text-primary-on-brand shadow-xs hover:bg-brand-solid-hover focus-visible:ring-2 focus-visible:ring-focus-ring">
              <Plus className="w-3.5 h-3.5 text-fg-white shrink-0" />
              <span>Propose Rule</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Column Container */}
      <main className="max-w-[960px] mx-auto px-xl pt-xl space-y-xl">
        {/* Overview Banner / State */}
        <div className="p-xl rounded-lg bg-secondary border border-secondary shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div>
            <div className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-brand-primary mb-xxs">
              <Sparkles className="w-3.5 h-3.5 text-fg-brand-primary shrink-0" />
              Autonomous Discovery
            </div>
            <h2 className="text-heading-xs font-semibold text-primary">
              {activeRulesForWeek.length} spend patterns active in Week {selectedWeek}
            </h2>
            <p className="text-sm text-secondary mt-xxs">
              Unwritten uncovers the implicit agreements behind your shared debit cards and shared bills.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-lg border-t md:border-t-0 md:border-l border-secondary pt-md md:pt-none md:pl-lg">
            <div>
              <div className="text-heading-xs font-bold text-primary">
                {ALL_RULES.filter(r => r.activeWeeks.includes(selectedWeek) && r.status === 'ratified').length}
              </div>
              <div className="text-xs text-tertiary">Ratified</div>
            </div>
            <div>
              <div className="text-heading-xs font-bold text-primary">
                {ALL_RULES.filter(r => r.activeWeeks.includes(selectedWeek) && r.status === 'observed').length}
              </div>
              <div className="text-xs text-tertiary">Observed</div>
            </div>
            <div>
              <div className="text-heading-xs font-bold text-warning-primary">
                {ALL_RULES.filter(r => r.activeWeeks.includes(selectedWeek) && r.status === 'drifting').length}
              </div>
              <div className="text-xs text-tertiary">Drifting</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="text-xs text-tertiary font-medium mr-xs flex items-center gap-xxs">
              <Filter className="w-3.5 h-3.5 text-fg-quaternary shrink-0" /> Filter:
            </span>
            {(['all', 'ratified', 'observed', 'drifting'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-xs px-md py-xs rounded-md font-medium capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-primary text-primary border border-secondary shadow-xs'
                    : 'text-secondary hover:text-primary hover:bg-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs text-tertiary">
            Showing rules effective up to <span className="text-primary font-medium">Week {selectedWeek}</span>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-md">
          {activeRulesForWeek.map(rule => (
            <div
              key={rule.id}
              className={`rounded-lg bg-secondary border border-secondary p-xl shadow-xs transition-all hover:border-brand ${
                selectedRuleId === rule.id ? 'ring-1 ring-focus-ring' : ''
              }`}
            >
              {/* Card Header: Category, Status Tag, Member */}
              <div className="flex items-center justify-between gap-md mb-sm">
                <div className="flex items-center gap-sm">
                  <span className="text-xs font-medium px-sm py-xxs rounded bg-tertiary text-secondary">
                    {rule.category}
                  </span>
                  <span className="text-xs text-quaternary">•</span>
                  <span className="text-xs text-tertiary flex items-center gap-xxs">
                    <Users className="w-3 h-3 text-fg-quaternary shrink-0" />
                    {rule.member}
                  </span>
                </div>
                <div>{getStatusBadge(rule.status)}</div>
              </div>

              {/* Plain-English Sentence */}
              <h3 className="text-md font-medium text-primary leading-relaxed mb-lg">
                "{rule.sentence}"
              </h3>

              {/* Confidence Bar & Evidence Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md rounded-lg bg-primary border border-secondary mb-lg">
                {/* Confidence Bar */}
                <div className="space-y-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary font-medium">Model Confidence</span>
                    <span className="text-primary font-semibold font-mono">{rule.confidence}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-tertiary">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${getConfidenceColor(rule.confidence)}`}
                      style={{ width: `${rule.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Evidence & Impact */}
                <div className="flex items-center justify-between md:justify-end gap-xl text-xs">
                  <div className="flex items-center gap-xs text-secondary">
                    <Receipt className="w-3.5 h-3.5 text-fg-quaternary shrink-0" />
                    <span>Evidence:</span>
                    <span className="font-semibold text-primary font-mono bg-secondary px-xs py-xxs rounded border border-secondary">
                      {rule.evidenceCount} transactions
                    </span>
                  </div>
                  <div className="flex items-center gap-xs text-secondary">
                    <TrendingUp className="w-3.5 h-3.5 text-fg-quaternary shrink-0" />
                    <span>Impact:</span>
                    <span className="font-semibold text-primary">{rule.discoveredImpact}</span>
                  </div>
                </div>
              </div>

              {/* Version Chain: "v1 → v2" */}
              <div className="border-t border-secondary pt-md flex flex-col sm:flex-row sm:items-center justify-between gap-sm text-xs">
                <div className="flex items-center gap-xs flex-wrap">
                  <span className="text-tertiary font-medium flex items-center gap-xxs mr-xs">
                    <History className="w-3.5 h-3.5 text-fg-quaternary shrink-0" /> Version Chain:
                  </span>
                  {rule.versionChain.map((ver, idx) => (
                    <React.Fragment key={ver.version}>
                      <span 
                        title={`${ver.note} (${ver.date})`}
                        className={`px-sm py-xxs rounded font-mono font-medium cursor-help transition-colors ${
                          idx === rule.versionChain.length - 1
                            ? 'bg-utility-brand-50 border border-utility-brand-200 text-utility-brand-700'
                            : 'bg-primary border border-secondary text-secondary'
                        }`}
                      >
                        {ver.version}
                      </span>
                      {idx < rule.versionChain.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-fg-quaternary shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-quaternary text-xs flex items-center gap-xs">
                  <span>First observed in Week {rule.introducedWeek}</span>
                  <ChevronRight className="w-3 h-3 text-fg-quaternary shrink-0" />
                </div>
              </div>
            </div>
          ))}

          {activeRulesForWeek.length === 0 && (
            <div className="p-xl rounded-lg bg-secondary border border-secondary text-center py-12">
              <Info className="w-8 h-8 text-fg-quaternary mx-auto mb-sm" />
              <div className="text-md font-medium text-primary">No rules match this filter for Week {selectedWeek}</div>
              <p className="text-xs text-tertiary mt-xxs">Try adjusting the status filter or slide to a different week.</p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Slider at the Bottom: "Week 1–6" */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-secondary shadow-lg">
        <div className="max-w-[960px] mx-auto px-xl py-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xs">
            <div className="flex items-center gap-sm">
              <div className="w-7 h-7 rounded bg-tertiary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-fg-brand-primary shrink-0" />
              </div>
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-xs">
                  Timeline Progression
                  <span className="text-xs font-normal text-tertiary">• Week 1–6</span>
                </div>
                <div className="text-xs text-secondary">
                  Showing discovered rule set as of <span className="font-semibold text-primary">Week {selectedWeek}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              {[1, 2, 3, 4, 5, 6].map(week => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  className={`px-sm py-xxs text-xs font-mono font-medium rounded transition-colors ${
                    selectedWeek === week
                      ? 'bg-brand-solid text-primary-on-brand shadow-xs'
                      : 'bg-tertiary text-secondary hover:text-primary'
                  }`}
                >
                  W{week}
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider Control */}
          <div className="space-y-xs pt-xs">
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              aria-label="Week 1–6 timeline"
              className="w-full cursor-pointer h-2 bg-primary rounded-lg appearance-none"
            />
            <div className="flex justify-between text-xs text-tertiary font-mono">
              <span>Week 1 (Baseline)</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6 (Present)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
