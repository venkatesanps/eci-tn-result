import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import styles from '../styles/Home.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface Alliance {
  name: string;
  seats: number;
  share: number;
  color: string;
  parties: string[];
  isWinner: boolean;
  range?: string;
}

interface Election {
  year: string;
  date: string;
  totalSeats: number;
  majority: number;
  status: string;
  winner: string;
  turnout: string;
  alliances: Alliance[];
  context: string;
  isProjected: boolean;
  projectedNote?: string;
}

interface LiveAlliance {
  name: string;
  won: number;
  leading: number;
  projected: number;
  range: string;
  color: string;
}

interface LiveSummary {
  status: 'projected' | 'counting' | 'declared';
  note: string;
  lastUpdated: string | null;
  lastChecked: string | null;
  totalSeats: number;
  majority: number;
  reported: number;
  alliances: LiveAlliance[];
}

interface CountPoint {
  time: string;
  [key: string]: string | number;
}

interface AlertItem {
  id: string;
  text: string;
  kind: 'win' | 'info' | 'swing';
  time: string;
}

// ── Static verified data (ECI) ─────────────────────────────────────────────

const ELECTIONS: Record<string, Election> = {
  '2021': {
    year: '2021',
    date: '6 April 2021',
    totalSeats: 234,
    majority: 118,
    status: 'Final Results',
    winner: 'DMK+',
    turnout: '72.8%',
    isProjected: false,
    alliances: [
      {
        name: 'DMK+ (INDIA)',
        seats: 159,
        share: 45.4,
        color: '#3b82f6',
        isWinner: true,
        parties: ['DMK — 133', 'INC — 18', 'VCK — 4', 'CPI — 2', 'CPM — 2'],
      },
      {
        name: 'AIADMK+',
        seats: 75,
        share: 39.6,
        color: '#ef4444',
        isWinner: false,
        parties: ['AIADMK — 66', 'BJP — 4', 'PMK — 5'],
      },
    ],
    context:
      'DMK won a decisive mandate under M.K. Stalin, ending 10 years of AIADMK rule. The election was held during the COVID-19 pandemic. AIADMK was weakened by internal splits following the 2017 death of J. Jayalalithaa.',
  },
  '2016': {
    year: '2016',
    date: '16 May 2016',
    totalSeats: 234,
    majority: 118,
    status: 'Final Results',
    winner: 'AIADMK',
    turnout: '73.5%',
    isProjected: false,
    alliances: [
      {
        name: 'AIADMK (alone)',
        seats: 136,
        share: 40.8,
        color: '#ef4444',
        isWinner: true,
        parties: ['AIADMK — 136 (contested all seats alone)'],
      },
      {
        name: 'DMK + INC',
        seats: 98,
        share: 43.5,
        color: '#3b82f6',
        isWinner: false,
        parties: ['DMK — 89', 'INC — 8', 'IUML — 1'],
      },
    ],
    context:
      'J. Jayalalithaa led AIADMK to a historic consecutive victory — first party in TN to win back-to-back terms in 40 years. A notable FPTP anomaly: DMK+INC received 43.5% of votes vs AIADMK\'s 40.8%, yet won only 98 seats to AIADMK\'s 136.',
  },
  '2011': {
    year: '2011',
    date: '13 April 2011',
    totalSeats: 234,
    majority: 118,
    status: 'Final Results',
    winner: 'AIADMK+',
    turnout: '73.1%',
    isProjected: false,
    alliances: [
      {
        name: 'AIADMK+ (NTNF)',
        seats: 203,
        share: 48.1,
        color: '#ef4444',
        isWinner: true,
        parties: ['AIADMK — 150', 'DMDK — 29', 'CPM — 10', 'CPI — 7', 'IUML — 4', 'Others — 3'],
      },
      {
        name: 'DMK+ (UPA)',
        seats: 31,
        share: 36.7,
        color: '#3b82f6',
        isWinner: false,
        parties: ['DMK — 23', 'INC — 5', 'PMK — 3'],
      },
    ],
    context:
      'AIADMK swept to a historic 203-seat landslide under J. Jayalalithaa. DMK suffered its worst-ever defeat, winning only 23 seats — down from 163 in 2006. Heavy anti-incumbency over the 2G spectrum scandal. DMDK (actor Vijayakanth) won 29 seats on debut, drawing votes away from DMK.',
  },
  '2026': {
    year: '2026',
    date: 'Expected April–May 2026',
    totalSeats: 234,
    majority: 118,
    status: 'Projected — Not Declared',
    winner: 'To be declared',
    turnout: 'Expected ~72–75%',
    isProjected: true,
    projectedNote:
      'Official results have not been declared. Seat figures below are midpoint estimates from pre-election surveys.',
    alliances: [
      {
        name: 'DMK+',
        seats: 142,
        share: 44.0,
        color: '#3b82f6',
        isWinner: false,
        range: '125–160',
        parties: ['DMK', 'INC', 'VCK', 'CPI', 'CPM', 'Others'],
      },
      {
        name: 'AIADMK+',
        seats: 72,
        share: 37.5,
        color: '#ef4444',
        isWinner: false,
        range: '55–85',
        parties: ['AIADMK', 'Allied regional parties'],
      },
      {
        name: 'NDA',
        seats: 20,
        share: 11.5,
        color: '#f97316',
        isWinner: false,
        range: '5–25',
        parties: ['BJP', 'PMK', 'Allied parties'],
      },
    ],
    context:
      'Tamil Nadu assembly elections are expected in April–May 2026. DMK under incumbent CM M.K. Stalin seeks a second term. AIADMK remains the main opposition despite post-Jayalalithaa leadership divisions. BJP-led NDA aims to expand its presence in Dravidian-dominated Tamil Nadu politics.',
  },
};

const SEAT_HISTORY = [
  { year: '2011', 'DMK+': 31, 'AIADMK+': 203 },
  { year: '2016', 'DMK+': 98, 'AIADMK+': 136 },
  { year: '2021', 'DMK+': 159, 'AIADMK+': 75 },
];

const SHARE_HISTORY = [
  { year: '2011', 'DMK+': 36.7, 'AIADMK+': 48.1 },
  { year: '2016', 'DMK+': 43.5, 'AIADMK+': 40.8 },
  { year: '2021', 'DMK+': 45.4, 'AIADMK+': 39.6 },
];

const YEARS = ['2011', '2016', '2021', '2026'];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 13 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedYear, setSelectedYear] = useState('2021');
  const [expandedAlliance, setExpandedAlliance] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [live, setLive] = useState<LiveSummary | null>(null);
  const [lastPolled, setLastPolled] = useState<string | null>(null);
  const [countHistory, setCountHistory] = useState<CountPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const prevLiveRef = useRef<LiveSummary | null>(null);
  const milestonesRef = useRef<Set<string>>(new Set());

  // ── Live data polling (30s) ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedYear !== '2026') return;
    const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

    const fetchLive = async () => {
      try {
        const res = await fetch(`${BASE}/data/live-summary.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data: LiveSummary = await res.json();
        setLive(data);

        const now = new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit',
        });
        setLastPolled(now);

        if (data.status === 'counting' || data.status === 'declared') {
          // Accumulate trajectory history
          setCountHistory((prev) => {
            const point: CountPoint = { time: now };
            for (const a of data.alliances) {
              point[a.name] = a.won + a.leading;
            }
            const updated = [...prev, point];
            return updated.length > 14 ? updated.slice(-14) : updated;
          });

          // Generate contextual alerts
          setAlerts((prevAlerts) => {
            const next = [...prevAlerts];
            const add = (text: string, kind: AlertItem['kind']) => {
              const key = text;
              if (!milestonesRef.current.has(key)) {
                milestonesRef.current.add(key);
                next.unshift({ id: `${Date.now()}-${Math.random()}`, text, kind, time: now });
              }
            };

            const prev = prevLiveRef.current;
            if (!prev || (prev.reported === 0 && data.reported > 0)) {
              add('Counting underway across 234 constituencies', 'info');
            }
            if (data.status === 'declared' && prev?.status !== 'declared') {
              add('All 234 results declared', 'win');
            }

            for (const a of data.alliances) {
              const total = a.won + a.leading;
              if (total >= data.majority) {
                add(`${a.name} has crossed the ${data.majority}-seat majority mark`, 'win');
              } else if (total >= 100) {
                add(`${a.name} wins / leads in 100+ seats`, 'info');
              } else if (total >= 50) {
                add(`${a.name} wins / leads in 50+ seats`, 'info');
              }
            }

            return next.slice(0, 8);
          });
        }

        prevLiveRef.current = data;
      } catch {
        // keep existing data
      }
    };

    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, [selectedYear]);

  // Reset live state when switching away from 2026
  useEffect(() => {
    if (selectedYear !== '2026') {
      setCountHistory([]);
      setAlerts([]);
      milestonesRef.current = new Set();
      prevLiveRef.current = null;
    }
  }, [selectedYear]);

  const election = ELECTIONS[selectedYear];
  const isCounting = selectedYear === '2026' && live && live.status === 'counting';
  const isDeclared = selectedYear === '2026' && live && live.status === 'declared';
  const isLive = isCounting || isDeclared;

  function handleYearChange(year: string) {
    setSelectedYear(year);
    setExpandedAlliance(null);
  }

  function liveLeader(): LiveAlliance | null {
    if (!live || !isLive) return null;
    return [...live.alliances].sort(
      (a, b) => (b.won + b.leading) - (a.won + a.leading)
    )[0] ?? null;
  }

  return (
    <>
      <Head>
        <title>
          {isLive ? 'TN Elections 2026 — LIVE Results' : 'Tamil Nadu Elections — Results & Analysis'}
        </title>
        <meta
          name="description"
          content="Tamil Nadu assembly election results (2011, 2016, 2021) and 2026 live results. Data from the Election Commission of India."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>

        {/* ── NAV ── */}
        <nav className={styles.nav}>
          <span className={styles.navBrand}>TN Elections</span>
          <div className={styles.navLinks}>
            <a href="#results">Results</a>
            <a href="#history" onClick={() => setShowHistory(true)}>History</a>
            <a href="#outlook">2026</a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <header className={styles.hero} id="top">
          <p className={styles.heroLabel}>234 constituencies · Tamil Nadu Assembly</p>
          <h1 className={styles.heroTitle}>
            {isLive ? 'Tamil Nadu 2026 — Live Results' : 'Tamil Nadu Election Results'}
          </h1>
          <p className={styles.heroSubtitle}>
            {isLive
              ? 'Counting in progress · ECI data updated every ~5 min · Page checks every 30 s'
              : 'Verified historical data from the Election Commission of India'}
          </p>
          {isLive && live && (
            <div className={styles.liveBar}>
              <span className={styles.liveDot} />
              <span className={styles.liveText}>
                {live.reported} / {live.totalSeats} seats reported
                {lastPolled && ` · Checked ${lastPolled} IST`}
              </span>
            </div>
          )}
        </header>

        {/* ── YEAR TABS ── */}
        <div className={styles.yearSection}>
          <div className={styles.yearTabs} role="tablist" aria-label="Select election year">
            {YEARS.map((y) => (
              <button
                key={y}
                role="tab"
                aria-selected={selectedYear === y}
                className={`${styles.yearTab} ${selectedYear === y ? styles.yearTabActive : ''}`}
                onClick={() => handleYearChange(y)}
              >
                {y}
                {y === '2026' && isLive && <span className={styles.liveBadge}>LIVE</span>}
                {y === '2026' && !isLive && <span className={styles.projBadge}>Projected</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <section id="results" className={styles.section}>
          <div className={styles.container}>

            {/* ══ 2026 LIVE COUNTING VIEW ══ */}
            {selectedYear === '2026' && isLive && live ? (
              <>
                {/* Status row */}
                <div className={styles.resultHeader}>
                  <div className={styles.metaRow}>
                    <span className={`${styles.statusPill} ${isDeclared ? styles.pillGreen : styles.pillLive}`}>
                      {isDeclared ? 'Results Declared' : 'Counting in Progress'}
                    </span>
                    <span className={styles.metaText}>
                      {live.reported} of {live.totalSeats} seats reported
                      ({Math.round((live.reported / live.totalSeats) * 100)}%)
                    </span>
                    <span className={styles.metaText}>Majority: {live.majority} seats</span>
                    {live.lastUpdated && (
                      <span className={styles.metaText}>ECI: {live.lastUpdated}</span>
                    )}
                  </div>
                </div>

                {/* ── Hero strip ── */}
                {(() => {
                  const leader = liveLeader();
                  if (!leader) return null;
                  const total = leader.won + leader.leading;
                  const hasMaj = leader.won >= live.majority;
                  const pctDone = Math.round((live.reported / live.totalSeats) * 100);
                  return (
                    <div className={styles.liveHeroStrip}>
                      <div className={styles.liveLeaderBlock}>
                        <p className={styles.liveLeaderLabel}>Currently leading</p>
                        <p className={styles.liveLeaderName} style={{ color: leader.color }}>
                          {leader.name}
                        </p>
                        <p className={styles.liveLeaderSub}>
                          {hasMaj
                            ? `Crossed ${live.majority}-seat majority mark`
                            : `${live.majority - total} seats from majority`}
                        </p>
                      </div>
                      <div className={styles.liveStatBox}>
                        <b>{live.reported}/{live.totalSeats}</b>
                        <span>seats counted</span>
                      </div>
                      <div className={styles.liveStatBox}>
                        <b>{pctDone}%</b>
                        <span>complete</span>
                      </div>
                      <div className={styles.liveStatBox}>
                        <b>{lastPolled || '—'}</b>
                        <span>last checked IST</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Reported progress rail */}
                <div className={styles.reportedBar}>
                  <div
                    className={styles.reportedFill}
                    style={{ width: `${(live.reported / live.totalSeats) * 100}%` }}
                  />
                </div>

                {/* ── Main grid: tally + alerts ── */}
                <div className={styles.liveTallyGrid}>

                  {/* Seat tally */}
                  <div className={styles.tallyCard}>
                    <div className={styles.cardH}>
                      <h3 className={styles.cardTitle}>Seat tally · won + leading</h3>
                      <span className={styles.cardSub}>Updated every ~5 min from ECI</span>
                    </div>
                    <div className={styles.tallyRows}>
                      {live.alliances.map((a) => {
                        const total = a.won + a.leading;
                        const wonPct = (a.won / live.totalSeats) * 100;
                        const totalPct = (total / live.totalSeats) * 100;
                        return (
                          <div key={a.name} className={styles.liveRow}>
                            <div className={styles.liveRowName}>
                              <span className={styles.liveRowDot} style={{ background: a.color }} />
                              <span>{a.name}</span>
                            </div>
                            <div className={styles.liveRowBarBg}>
                              {/* leading overlay (translucent) */}
                              <div
                                className={styles.liveRowBarLeading}
                                style={{ width: `${totalPct}%`, background: a.color }}
                              />
                              {/* won fill (solid) */}
                              <div
                                className={styles.liveRowBarWon}
                                style={{ width: `${wonPct}%`, background: a.color }}
                              />
                            </div>
                            <div className={styles.liveRowCount}>
                              <span className={styles.liveRowTotal} style={{ color: a.color }}>
                                {total}
                              </span>
                              <span className={styles.liveRowDetail}>
                                {a.won} won
                                {a.leading > 0 && ` · ${a.leading} leading`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className={styles.tallyFooter}>
                        <span>Majority threshold: {live.majority} seats</span>
                        <span>{live.totalSeats - live.reported} still counting</span>
                      </div>
                    </div>
                  </div>

                  {/* Alert feed */}
                  <div className={styles.tallyCard}>
                    <div className={styles.cardH}>
                      <h3 className={styles.cardTitle}>Live alerts</h3>
                      <span className={styles.cardSub}>{alerts.length} events</span>
                    </div>
                    <div className={styles.alertFeed}>
                      {alerts.length === 0 && (
                        <p className={styles.alertEmpty}>Awaiting results…</p>
                      )}
                      {alerts.map((a) => (
                        <div
                          key={a.id}
                          className={`${styles.alertItem} ${
                            a.kind === 'win'   ? styles.alertWin :
                            a.kind === 'swing' ? styles.alertSwing :
                            styles.alertInfo
                          }`}
                        >
                          <div className={styles.alertTime}>{a.time}</div>
                          <div className={styles.alertText}>{a.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Counting trajectory ── */}
                {countHistory.length > 2 && (
                  <div className={styles.tallyCard} style={{ marginTop: '1rem' }}>
                    <div className={styles.cardH}>
                      <h3 className={styles.cardTitle}>Counting trajectory</h3>
                      <span className={styles.cardSub}>Seats won + leading by update round</span>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={countHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 234]} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                          {live.alliances
                            .filter((a) => a.color !== '#64748b')
                            .map((a) => (
                              <Line
                                key={a.name}
                                dataKey={a.name}
                                stroke={a.color}
                                strokeWidth={2}
                                dot={{ r: 3, fill: a.color }}
                                activeDot={{ r: 5 }}
                              />
                            ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Majority viz bar */}
                <div className={styles.majorityBar} style={{ marginTop: '1rem' }}>
                  <div
                    className={styles.majorityLine}
                    style={{ left: `${(live.majority / live.totalSeats) * 100}%` }}
                  />
                  <div className={styles.majoritySegs}>
                    {live.alliances.map((a) => (
                      <div
                        key={a.name}
                        style={{
                          width: `${((a.won + a.leading) / live.totalSeats) * 100}%`,
                          background: a.color,
                          height: '100%',
                          opacity: 0.85,
                        }}
                        title={`${a.name}: ${a.won + a.leading} seats`}
                      />
                    ))}
                  </div>
                  <p className={styles.majorityCaption}>← Majority at {live.majority} seats →</p>
                </div>

                <div className={styles.contextCard}>
                  <p className={styles.contextText}>
                    Live counting data sourced from the Election Commission of India.
                    <strong> Won</strong> = result declared.
                    <strong> Leading</strong> = candidate ahead but not yet declared.
                    Data refreshed every ~5 minutes via GitHub Actions.
                  </p>
                  <p className={styles.sourceNote}>Source: results.eci.gov.in</p>
                </div>
              </>
            ) : (
              /* ══ STATIC / PROJECTED VIEW ══ */
              <>
                <div className={styles.resultHeader}>
                  <div>
                    <div className={styles.metaRow}>
                      <span
                        className={`${styles.statusPill} ${
                          election.isProjected ? styles.pillAmber : styles.pillGreen
                        }`}
                      >
                        {election.status}
                      </span>
                      <span className={styles.metaText}>{election.date}</span>
                      <span className={styles.metaText}>Turnout: {election.turnout}</span>
                      <span className={styles.metaText}>Majority: {election.majority} seats</span>
                    </div>
                  </div>
                  {!election.isProjected && (
                    <div className={styles.winnerChip}>
                      <span className={styles.winnerChipLabel}>Winner</span>
                      <span className={styles.winnerChipValue}>{election.winner}</span>
                    </div>
                  )}
                </div>

                {election.isProjected && (
                  <div className={styles.projWarning}>
                    <span className={styles.projIcon}>⚠</span>
                    <p>
                      <strong>Projected data only.</strong> {election.projectedNote}
                      {selectedYear === '2026' && lastPolled && (
                        <> Page checked ECI at {lastPolled} IST — no live results yet.</>
                      )}
                    </p>
                  </div>
                )}

                <div className={styles.allianceGrid}>
                  {election.alliances.map((a) => {
                    const pct = Math.round((a.seats / election.totalSeats) * 100);
                    const isOpen = expandedAlliance === a.name;
                    return (
                      <div
                        key={a.name}
                        className={`${styles.allianceCard} ${a.isWinner ? styles.cardWinner : ''}`}
                        style={{ '--party-color': a.color } as React.CSSProperties}
                      >
                        <div className={styles.cardTop}>
                          <div className={styles.cardLeft}>
                            <h3 className={styles.allianceName}>{a.name}</h3>
                            {a.isWinner && <span className={styles.wonTag}>Won</span>}
                          </div>
                          <div className={styles.cardStats}>
                            <div className={styles.stat}>
                              <span className={styles.statNum} style={{ color: a.color }}>
                                {election.isProjected && a.range ? `~${a.seats}` : a.seats}
                              </span>
                              <span className={styles.statLbl}>
                                {election.isProjected ? 'proj. seats' : 'seats won'}
                              </span>
                            </div>
                            <div className={styles.stat}>
                              <span className={styles.statNum}>{a.share}%</span>
                              <span className={styles.statLbl}>vote share</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${pct}%`, background: a.color }} />
                        </div>
                        {election.isProjected && a.range && (
                          <p className={styles.rangeNote}>Projected range: {a.range} seats</p>
                        )}

                        <button
                          className={styles.drillBtn}
                          onClick={() => setExpandedAlliance(isOpen ? null : a.name)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? '▲ Hide breakdown' : '▼ Party breakdown'}
                        </button>

                        {isOpen && (
                          <ul className={styles.partyList}>
                            {a.parties.map((p) => (
                              <li key={p} className={styles.partyItem}>{p}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.majorityBar}>
                  <div
                    className={styles.majorityLine}
                    style={{ left: `${(election.majority / election.totalSeats) * 100}%` }}
                  />
                  <div className={styles.majoritySegs}>
                    {election.alliances.map((a) => (
                      <div
                        key={a.name}
                        style={{
                          width: `${(a.seats / election.totalSeats) * 100}%`,
                          background: a.color,
                          height: '100%',
                          opacity: 0.85,
                        }}
                        title={`${a.name}: ${a.seats} seats`}
                      />
                    ))}
                  </div>
                  <p className={styles.majorityCaption}>
                    ← Majority mark at {election.majority} seats (
                    {Math.round((election.majority / election.totalSeats) * 100)}%) →
                  </p>
                </div>

                <div className={styles.contextCard}>
                  <p className={styles.contextText}>{election.context}</p>
                  {!election.isProjected && (
                    <p className={styles.sourceNote}>
                      Data source: Election Commission of India — eci.gov.in
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── HISTORY ── */}
        <section id="history" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>Election History</h2>
                <p className={styles.sectionSub}>Verified results · 2011 · 2016 · 2021</p>
              </div>
              <button
                className={styles.expandToggle}
                onClick={() => setShowHistory((v) => !v)}
                aria-expanded={showHistory}
              >
                {showHistory ? '▲ Collapse' : '▼ Show charts'}
              </button>
            </div>

            <div className={styles.summaryTable}>
              <div className={styles.tableHead}>
                <span>Year</span>
                <span>Winner</span>
                <span>DMK+ seats</span>
                <span>AIADMK+ seats</span>
                <span>Turnout</span>
              </div>
              {[
                { year: '2011', winner: 'AIADMK+', dmk: 31,  aiadmk: 203, turnout: '73.1%' },
                { year: '2016', winner: 'AIADMK',  dmk: 98,  aiadmk: 136, turnout: '73.5%' },
                { year: '2021', winner: 'DMK+',    dmk: 159, aiadmk: 75,  turnout: '72.8%' },
              ].map((row) => (
                <div
                  key={row.year}
                  className={`${styles.tableRow} ${selectedYear === row.year ? styles.tableRowActive : ''}`}
                  onClick={() => handleYearChange(row.year)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleYearChange(row.year)}
                >
                  <span className={styles.tableYear}>{row.year}</span>
                  <span
                    className={styles.tableWinner}
                    style={{ color: row.winner.startsWith('DMK') ? '#3b82f6' : '#ef4444' }}
                  >
                    {row.winner}
                  </span>
                  <span style={{ color: '#3b82f6' }}>{row.dmk}</span>
                  <span style={{ color: '#ef4444' }}>{row.aiadmk}</span>
                  <span className={styles.tableMuted}>{row.turnout}</span>
                </div>
              ))}
            </div>

            {showHistory && (
              <div className={styles.chartsWrap}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Seats Won</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={SEAT_HISTORY} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 234]} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Bar dataKey="DMK+" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="AIADMK+" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className={styles.chartNote}>Majority line: 118 seats</p>
                </div>

                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Vote Share (%)</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={SHARE_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[30, 55]} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Line dataKey="DMK+" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
                      <Line dataKey="AIADMK+" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className={styles.chartNote}>2016: FPTP anomaly — DMK+INC got more votes but fewer seats</p>
                </div>
              </div>
            )}

            <div className={styles.patternsGrid}>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>↩</div>
                <h4>Power Alternation</h4>
                <p>Tamil Nadu has alternated between DMK and AIADMK every 1–2 terms since 1977. No party has won three consecutive terms.</p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>⊘</div>
                <h4>FPTP Seat-Vote Disconnect</h4>
                <p>In 2016, DMK+INC won more votes (43.5%) than AIADMK (40.8%) yet won 38 fewer seats — a stark illustration of first-past-the-post effects.</p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>↑</div>
                <h4>DMK Vote Share Growth</h4>
                <p>DMK+ alliance vote share has risen from 36.7% (2011) to 45.4% (2021), a gain of 8.7 percentage points over three cycles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2026 OUTLOOK ── */}
        <section id="outlook" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>2026 Outlook</h2>
            <p className={styles.sectionSub}>
              {isLive
                ? 'Live counting underway — see Results tab above for latest'
                : 'Pre-election analysis · Projections only · Not official results'}
            </p>

            <div className={styles.outlookGrid}>
              <div className={styles.outlookCard}>
                <h3>Key Factors</h3>
                <ul className={styles.factorList}>
                  <li><strong>DMK incumbency:</strong> CM M.K. Stalin seeks re-election on development credentials.</li>
                  <li><strong>AIADMK fragmentation:</strong> Ongoing EPS-OPS split weakens the main opposition.</li>
                  <li><strong>BJP/NDA factor:</strong> BJP-led NDA aims to break into Dravidian politics. Won only 4 seats in 2021.</li>
                  <li><strong>Anti-incumbency risk:</strong> Dravidian pattern favours rotation every 1–2 terms.</li>
                  <li><strong>50-year Dravidian milestone:</strong> 2026 marks 50 years since DMK and AIADMK took full control of TN politics.</li>
                </ul>
              </div>

              <div className={styles.outlookCard}>
                <h3>{isLive ? 'Live Tally' : 'Survey Projections'}</h3>
                <p className={styles.outlookNote}>
                  {isLive ? 'Real-time won + leading counts' : 'Pre-election survey ranges — not official results'}
                </p>
                {(isLive && live ? live.alliances : ELECTIONS['2026'].alliances).map((a) => {
                  const liveA = a as LiveAlliance;
                  const staticA = a as Alliance;
                  const isLiveItem = isLive && live;
                  const displayVal = isLiveItem
                    ? `${liveA.won + liveA.leading} seats`
                    : (staticA.range ?? `~${staticA.seats}`);
                  const barW = isLiveItem
                    ? ((liveA.won + liveA.leading) / 234) * 100
                    : (staticA.seats / 234) * 100;
                  return (
                    <div key={a.name} className={styles.projRow}>
                      <span className={styles.projName} style={{ color: a.color }}>{a.name}</span>
                      <div className={styles.projTrack}>
                        <div className={styles.projFill} style={{ width: `${barW}%`, background: a.color }} />
                      </div>
                      <span className={styles.projRange}>{displayVal}</span>
                    </div>
                  );
                })}
                <p className={styles.majorityRef}>Majority required: 118 of 234 seats</p>
              </div>
            </div>

            <div className={styles.disclaimerBox}>
              <strong>Data transparency note:</strong> Historical results 2011–2021 are verified from official ECI
              records. The 2026 data is pre-election survey projections until official results are declared.{' '}
              {isLive ? 'Live counts above sourced from ECI, updated every ~5 min.' : 'Projected ranges do not sum to exactly 234.'}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={styles.footer}>
          <p>
            Data sourced from the{' '}
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">Election Commission of India</a>
            {' '}· Historical results 2011–2021 verified
          </p>
          <p>
            {isLive
              ? '2026 live results from results.eci.gov.in · refreshed every ~5 min'
              : '2026 projections are unofficial pre-election survey estimates'}
          </p>
          <p className={styles.footerSmall}>Tamil Nadu Assembly · 234 constituencies · Majority: 118 seats</p>
        </footer>

      </div>
    </>
  );
}
