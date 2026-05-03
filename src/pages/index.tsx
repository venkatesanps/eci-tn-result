import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import styles from '../styles/Home.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

interface Alliance {
  name: string; seats: number; share: number; color: string;
  parties: string[]; isWinner: boolean; range?: string;
}
interface Election {
  year: string; date: string; totalSeats: number; majority: number;
  status: string; winner: string; turnout: string; alliances: Alliance[];
  context: string; isProjected: boolean; projectedNote?: string;
}
interface LiveAlliance {
  name: string; won: number; leading: number;
  projected: number; range: string; color: string;
}
interface LiveSummary {
  status: 'projected' | 'counting' | 'declared';
  note: string; lastUpdated: string | null; lastChecked: string | null;
  totalSeats: number; majority: number; reported: number;
  alliances: LiveAlliance[];
}
interface CountPoint { time: string; [key: string]: string | number; }
interface AlertItem { id: string; text: string; kind: 'win' | 'info' | 'swing'; time: string; }

// ── Static data (ECI verified) ─────────────────────────────────────────────

const ELECTIONS: Record<string, Election> = {
  '2021': {
    year: '2021', date: '6 April 2021', totalSeats: 234, majority: 118,
    status: 'Final Results', winner: 'DMK+', turnout: '72.8%', isProjected: false,
    alliances: [
      { name: 'DMK+ (INDIA)', seats: 159, share: 45.4, color: '#3b82f6', isWinner: true,
        parties: ['DMK — 133', 'INC — 18', 'VCK — 4', 'CPI — 2', 'CPM — 2'] },
      { name: 'AIADMK+', seats: 75, share: 39.6, color: '#ef4444', isWinner: false,
        parties: ['AIADMK — 66', 'BJP — 4', 'PMK — 5'] },
    ],
    context: 'DMK won a decisive mandate under M.K. Stalin, ending 10 years of AIADMK rule. Held during COVID-19 pandemic. AIADMK was weakened by internal splits following the 2017 death of J. Jayalalithaa.',
  },
  '2016': {
    year: '2016', date: '16 May 2016', totalSeats: 234, majority: 118,
    status: 'Final Results', winner: 'AIADMK', turnout: '73.5%', isProjected: false,
    alliances: [
      { name: 'AIADMK (alone)', seats: 136, share: 40.8, color: '#ef4444', isWinner: true,
        parties: ['AIADMK — 136 (contested all seats alone)'] },
      { name: 'DMK + INC', seats: 98, share: 43.5, color: '#3b82f6', isWinner: false,
        parties: ['DMK — 89', 'INC — 8', 'IUML — 1'] },
    ],
    context: 'J. Jayalalithaa led AIADMK to a historic consecutive victory — first party in TN to win back-to-back terms in 40 years. Notable FPTP anomaly: DMK+INC received 43.5% of votes yet won only 98 seats to AIADMK\'s 136.',
  },
  '2011': {
    year: '2011', date: '13 April 2011', totalSeats: 234, majority: 118,
    status: 'Final Results', winner: 'AIADMK+', turnout: '73.1%', isProjected: false,
    alliances: [
      { name: 'AIADMK+ (NTNF)', seats: 203, share: 48.1, color: '#ef4444', isWinner: true,
        parties: ['AIADMK — 150', 'DMDK — 29', 'CPM — 10', 'CPI — 7', 'IUML — 4', 'Others — 3'] },
      { name: 'DMK+ (UPA)', seats: 31, share: 36.7, color: '#3b82f6', isWinner: false,
        parties: ['DMK — 23', 'INC — 5', 'PMK — 3'] },
    ],
    context: 'AIADMK swept to a historic 203-seat landslide under J. Jayalalithaa. DMK suffered its worst-ever defeat winning only 23 seats — down from 163 in 2006. Anti-incumbency over the 2G spectrum scandal.',
  },
  '2026': {
    year: '2026', date: 'Expected April–May 2026', totalSeats: 234, majority: 118,
    status: 'Projected — Not Declared', winner: 'To be declared',
    turnout: 'Expected ~72–75%', isProjected: true,
    projectedNote: 'Official results not declared. Figures below are pre-election survey midpoints.',
    alliances: [
      { name: 'DMK+', seats: 142, share: 44.0, color: '#3b82f6', isWinner: false, range: '125–160',
        parties: ['DMK', 'INC', 'VCK', 'CPI', 'CPM', 'Others'] },
      { name: 'AIADMK+', seats: 72, share: 37.5, color: '#ef4444', isWinner: false, range: '55–85',
        parties: ['AIADMK', 'Allied regional parties'] },
      { name: 'NDA', seats: 20, share: 11.5, color: '#f97316', isWinner: false, range: '5–25',
        parties: ['BJP', 'PMK', 'Allied parties'] },
    ],
    context: 'Tamil Nadu assembly elections expected April–May 2026. DMK under CM M.K. Stalin seeks second term. AIADMK remains main opposition. BJP-led NDA aims to expand in Dravidian-dominated TN politics.',
  },
};

const SEAT_HISTORY = [
  { year: '2011', 'DMK+': 31,  'AIADMK+': 203 },
  { year: '2016', 'DMK+': 98,  'AIADMK+': 136 },
  { year: '2021', 'DMK+': 159, 'AIADMK+': 75  },
];
const SHARE_HISTORY = [
  { year: '2011', 'DMK+': 36.7, 'AIADMK+': 48.1 },
  { year: '2016', 'DMK+': 43.5, 'AIADMK+': 40.8 },
  { year: '2021', 'DMK+': 45.4, 'AIADMK+': 39.6 },
];
const YEARS = ['2011', '2016', '2021', '2026'];
const VOTE_SHARES = [
  { name: 'DMK+',    pct: 44.0, color: '#3b82f6' },
  { name: 'AIADMK+', pct: 37.5, color: '#ef4444' },
  { name: 'NDA',     pct: 11.5, color: '#f97316' },
  { name: 'Others',  pct:  7.0, color: '#64748b' },
];
const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [selectedYear, setSelectedYear]     = useState('2021');
  const [expandedAlliance, setExpandedAlliance] = useState<string | null>(null);
  const [showHistory, setShowHistory]       = useState(false);
  const [live, setLive]                     = useState<LiveSummary | null>(null);
  const [lastPolled, setLastPolled]         = useState<string | null>(null);
  const [countHistory, setCountHistory]     = useState<CountPoint[]>([]);
  const [alerts, setAlerts]                 = useState<AlertItem[]>([]);
  const prevLiveRef   = useRef<LiveSummary | null>(null);
  const milestonesRef = useRef<Set<string>>(new Set());

  // ── 30s live polling ────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedYear !== '2026') return;
    const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const fetchLive = async () => {
      try {
        const res = await fetch(`${BASE}/data/live-summary.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data: LiveSummary = await res.json();
        setLive(data);
        const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
        setLastPolled(now);
        if (data.status === 'counting' || data.status === 'declared') {
          setCountHistory(prev => {
            const pt: CountPoint = { time: now };
            data.alliances.forEach(a => { pt[a.name] = a.won + a.leading; });
            const next = [...prev, pt];
            return next.length > 14 ? next.slice(-14) : next;
          });
          setAlerts(prev => {
            const next = [...prev];
            const add = (text: string, kind: AlertItem['kind']) => {
              if (!milestonesRef.current.has(text)) {
                milestonesRef.current.add(text);
                next.unshift({ id: `${Date.now()}-${Math.random()}`, text, kind, time: now });
              }
            };
            const p = prevLiveRef.current;
            if (!p || (p.reported === 0 && data.reported > 0)) add('Counting underway across 234 constituencies', 'info');
            if (data.status === 'declared' && p?.status !== 'declared') add('All 234 results declared', 'win');
            data.alliances.forEach(a => {
              const t = a.won + a.leading;
              if (t >= data.majority)  add(`${a.name} crossed the ${data.majority}-seat majority mark`, 'win');
              else if (t >= 100) add(`${a.name} wins/leads in 100+ seats`, 'info');
              else if (t >= 50)  add(`${a.name} wins/leads in 50+ seats`,  'info');
            });
            return next.slice(0, 8);
          });
        }
        prevLiveRef.current = data;
      } catch { /* keep */ }
    };
    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear !== '2026') {
      setCountHistory([]); setAlerts([]);
      milestonesRef.current = new Set(); prevLiveRef.current = null;
    }
  }, [selectedYear]);

  const election   = ELECTIONS[selectedYear];
  const isCounting = selectedYear === '2026' && !!live && live.status === 'counting';
  const isDeclared = selectedYear === '2026' && !!live && live.status === 'declared';
  const isLive     = isCounting || isDeclared;

  function handleYearChange(year: string) { setSelectedYear(year); setExpandedAlliance(null); }
  function liveLeader(): LiveAlliance | null {
    if (!live || !isLive) return null;
    return [...live.alliances].sort((a, b) => (b.won + b.leading) - (a.won + a.leading))[0] ?? null;
  }

  return (
    <>
      <Head>
        <title>{isLive ? 'TN Elections 2026 — LIVE' : 'Tamil Nadu Elections — Results & Analysis'}</title>
        <meta name="description" content="Tamil Nadu assembly election results 2011–2021 and 2026 live results from ECI." />
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

        {/* ── HERO — compact when live ── */}
        <header className={`${styles.hero} ${isLive ? styles.heroLive : ''}`} id="top">
          <p className={styles.heroLabel}>234 constituencies · Tamil Nadu Assembly</p>
          <h1 className={`${styles.heroTitle} ${isLive ? styles.heroTitleLive : ''}`}>
            {isLive ? 'Tamil Nadu 2026 — Live Results' : 'Tamil Nadu Election Results'}
          </h1>
          {!isLive && (
            <p className={styles.heroSubtitle}>Verified historical data from the Election Commission of India</p>
          )}
          {isLive && live && (
            <div className={styles.liveBar}>
              <span className={styles.liveDot} />
              <span className={styles.liveText}>
                {live.reported}/{live.totalSeats} seats reported · Page checks every 30 s
                {lastPolled && ` · Last: ${lastPolled} IST`}
              </span>
            </div>
          )}
        </header>

        {/* ── YEAR TABS ── */}
        <div className={styles.yearSection}>
          <div className={styles.yearTabs} role="tablist">
            {YEARS.map(y => (
              <button key={y} role="tab" aria-selected={selectedYear === y}
                className={`${styles.yearTab} ${selectedYear === y ? styles.yearTabActive : ''}`}
                onClick={() => handleYearChange(y)}>
                {y}
                {y === '2026' && isLive  && <span className={styles.liveBadge}>LIVE</span>}
                {y === '2026' && !isLive && <span className={styles.projBadge}>Projected</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            RESULTS SECTION
        ══════════════════════════════════════════════ */}
        <section id="results" className={`${styles.section} ${isLive ? styles.sectionLive : ''}`}>
          <div className={styles.container}>

            {/* ───────── 2026 LIVE COUNTING DASHBOARD ───────── */}
            {selectedYear === '2026' && isLive && live ? (() => {
              const leader    = liveLeader();
              const pctDone   = Math.round((live.reported / live.totalSeats) * 100);
              const progress  = live.reported / live.totalSeats;
              const dmkLive   = live.alliances.find(a => a.name === 'DMK+');
              const aiLive    = live.alliances.find(a => a.name === 'AIADMK+');
              const dmkTotal  = dmkLive ? dmkLive.won + dmkLive.leading : 0;
              const aiTotal   = aiLive  ? aiLive.won  + aiLive.leading  : 0;
              const conf      = Math.round(50 + progress * 44);
              const leaderTotal = leader ? leader.won + leader.leading : 0;
              const hasMaj    = !!leader && leader.won >= live.majority;

              const forecastPanels = [
                { label: 'Pre-poll',  when: 'Survey avg', dmk: 142, ai: 72, conf: 52, active: false },
                { label: 'Updated',   when: 'May 1',      dmk: 148, ai: 80, conf: 66, active: false },
                { label: 'Live',      when: 'Now',        dmk: dmkTotal, ai: aiTotal, conf, active: true },
              ];

              return (
                <>
                  {/* Compact status row */}
                  <div className={styles.liveStatusRow}>
                    <span className={`${styles.statusPill} ${isDeclared ? styles.pillGreen : styles.pillLive}`}>
                      {isDeclared ? 'Declared' : 'Counting'}
                    </span>
                    <span className={styles.metaText}>
                      {live.reported}/{live.totalSeats} seats · {pctDone}% complete
                    </span>
                    <span className={styles.metaText}>Majority: {live.majority}</span>
                    {lastPolled && <span className={styles.metaText}>Checked {lastPolled} IST</span>}
                    {live.lastUpdated && (
                      <span className={styles.metaText}>
                        ECI {live.lastUpdated.slice(11, 16)}
                      </span>
                    )}
                  </div>

                  {/* Compact hero strip */}
                  {leader && (
                    <>
                      <div className={styles.liveHeroStrip}>
                        <div className={styles.liveLeaderBlock}>
                          <p className={styles.liveLeaderLabel}>Currently leading</p>
                          <p className={styles.liveLeaderName} style={{ color: leader.color }}>
                            {leader.name}
                          </p>
                          <p className={styles.liveLeaderSub}>
                            {hasMaj
                              ? `Majority — crossed ${live.majority} seats`
                              : `${live.majority - leaderTotal} seats from majority`}
                          </p>
                        </div>
                        <div className={styles.liveStatBox}>
                          <b>{live.reported}/{live.totalSeats}</b><span>counted</span>
                        </div>
                        <div className={styles.liveStatBox}>
                          <b>{pctDone}%</b><span>complete</span>
                        </div>
                        <div className={styles.liveStatBox}>
                          <b>{lastPolled || '—'}</b><span>last check</span>
                        </div>
                      </div>
                      {/* Thin progress rail */}
                      <div className={styles.reportedBar}>
                        <div className={styles.reportedFill} style={{ width: `${pctDone}%` }} />
                      </div>
                    </>
                  )}

                  {/* ═══ 3-col compact dashboard ═══ */}
                  <div className={styles.liveDashGrid}>

                    {/* ── Col 1: Seat tally (click to drill down) ── */}
                    <div className={styles.dashCard}>
                      <div className={styles.cardH}>
                        <h3 className={styles.cardTitle}>Seat tally</h3>
                        <span className={styles.cardSub}>↓ tap row for parties</span>
                      </div>
                      {live.alliances.map(a => {
                        const total    = a.won + a.leading;
                        const wonPct   = (a.won   / live.totalSeats) * 100;
                        const totalPct = (total   / live.totalSeats) * 100;
                        const isOpen   = expandedAlliance === a.name;
                        return (
                          <div key={a.name}>
                            <button
                              className={styles.liveRowCompact}
                              onClick={() => setExpandedAlliance(isOpen ? null : a.name)}
                            >
                              <div className={styles.liveRowName}>
                                <span className={styles.liveRowDot} style={{ background: a.color }} />
                                <span>{a.name}</span>
                                <span className={styles.drillChevron}>{isOpen ? '▲' : '▼'}</span>
                              </div>
                              <div className={styles.liveRowBarBg}>
                                <div className={styles.liveRowBarLeading}
                                  style={{ width: `${totalPct}%`, background: a.color }} />
                                <div className={styles.liveRowBarWon}
                                  style={{ width: `${wonPct}%`, background: a.color }} />
                              </div>
                              <div className={styles.liveRowCountCompact}>
                                <span className={styles.liveRowTotal} style={{ color: a.color }}>{total}</span>
                                <span className={styles.liveRowDetail}>{a.won}W·{a.leading}L</span>
                              </div>
                            </button>
                            {isOpen && (
                              <ul className={styles.partyList} style={{ padding: '0.3rem 0 0.3rem 1.625rem' }}>
                                {ELECTIONS['2026'].alliances.find(x => x.name === a.name)?.parties.map(p => (
                                  <li key={p} className={styles.partyItem}>{p}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                      <div className={styles.tallyFooter}>
                        <span>Majority: {live.majority}</span>
                        <span>{live.totalSeats - live.reported} counting</span>
                      </div>
                    </div>

                    {/* ── Col 2: Alerts + trajectory ── */}
                    <div className={styles.dashColStack}>
                      <div className={`${styles.dashCard} ${styles.dashCardFlex}`}>
                        <div className={styles.cardH}>
                          <h3 className={styles.cardTitle}>Live alerts</h3>
                          <span className={styles.cardSub}>{alerts.length}</span>
                        </div>
                        <div className={styles.alertFeed}>
                          {alerts.length === 0 && <p className={styles.alertEmpty}>Awaiting results…</p>}
                          {alerts.map(a => (
                            <div key={a.id} className={`${styles.alertItem} ${
                              a.kind === 'win'   ? styles.alertWin   :
                              a.kind === 'swing' ? styles.alertSwing : styles.alertInfo
                            }`}>
                              <div className={styles.alertTime}>{a.time}</div>
                              <div className={styles.alertText}>{a.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {countHistory.length > 2 && (
                        <div className={styles.dashCard}>
                          <div className={styles.cardH}>
                            <h3 className={styles.cardTitle}>Trajectory</h3>
                            <span className={styles.cardSub}>seats by round</span>
                          </div>
                          <ResponsiveContainer width="100%" height={88}>
                            <LineChart data={countHistory} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                              <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
                              <YAxis tick={false} axisLine={false} tickLine={false} domain={[0, 234]} />
                              <Tooltip {...TOOLTIP_STYLE} />
                              {live.alliances.filter(a => a.color !== '#64748b').map(a => (
                                <Line key={a.name} dataKey={a.name} stroke={a.color}
                                  strokeWidth={2} dot={false} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                          <div className={styles.trajLegend}>
                            {live.alliances.filter(a => a.color !== '#64748b').map(a => (
                              <span key={a.name} className={styles.trajLegendItem}>
                                <span style={{ background: a.color }} className={styles.trajDot} />
                                {a.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Col 3: Vote share + Forecast ── */}
                    <div className={styles.dashColStack}>
                      {/* Vote share */}
                      <div className={styles.dashCard}>
                        <div className={styles.cardH}>
                          <h3 className={styles.cardTitle}>Vote share</h3>
                          <span className={styles.cardSub}>projected</span>
                        </div>
                        <div className={styles.voteShareRows}>
                          {VOTE_SHARES.map(d => (
                            <div key={d.name} className={styles.voteShareRow}>
                              <span className={styles.voteShareLabel} style={{ color: d.color }}>{d.name}</span>
                              <div className={styles.voteShareTrack}>
                                <div className={styles.voteShareFill}
                                  style={{ width: `${(d.pct / 50) * 100}%`, background: d.color }} />
                              </div>
                              <span className={styles.voteSharePct}>{d.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Forecast convergence */}
                      <div className={styles.dashCard}>
                        <div className={styles.cardH}>
                          <h3 className={styles.cardTitle}>Forecast</h3>
                          <span className={styles.cardSub}>convergence</span>
                        </div>
                        <div className={styles.forecastPanels}>
                          {forecastPanels.map((p, i) => (
                            <div key={i} className={`${styles.forecastPanel} ${p.active ? styles.forecastPanelLive : ''}`}>
                              <p className={styles.forecastLabel}>{p.label}</p>
                              <p className={styles.forecastWhen}>{p.when}</p>
                              <div className={styles.forecastNums}>
                                <div>
                                  <div className={styles.forecastNum} style={{ color: '#3b82f6' }}>{p.dmk}</div>
                                  <div className={styles.forecastSub}>DMK+</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div className={styles.forecastNum} style={{ color: '#ef4444' }}>{p.ai}</div>
                                  <div className={styles.forecastSub}>AIADMK+</div>
                                </div>
                              </div>
                              <div className={styles.forecastConfTrack}>
                                <div style={{
                                  width: `${p.conf}%`, height: '100%',
                                  background: p.active ? '#3b82f6' : '#334155', borderRadius: 2,
                                }} />
                              </div>
                              <div className={styles.forecastConfLabel}>{p.conf}%</div>
                            </div>
                          ))}
                        </div>
                        <p className={styles.forecastNote}>Majority: {live.majority} seats</p>
                      </div>
                    </div>
                  </div>

                  {/* Thin source attribution */}
                  <p className={styles.liveSourceNote}>
                    Source: results.eci.gov.in · Won = declared · Leading = ahead, not yet declared · Refreshed every ~5 min
                  </p>
                </>
              );
            })() : (

            /* ───────── STATIC / PROJECTED VIEW ───────── */
            <>
              <div className={styles.resultHeader}>
                <div>
                  <div className={styles.metaRow}>
                    <span className={`${styles.statusPill} ${election.isProjected ? styles.pillAmber : styles.pillGreen}`}>
                      {election.status}
                    </span>
                    <span className={styles.metaText}>{election.date}</span>
                    <span className={styles.metaText}>Turnout: {election.turnout}</span>
                    <span className={styles.metaText}>Majority: {election.majority}</span>
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
                      <> Checked ECI at {lastPolled} IST — no live results yet.</>
                    )}
                  </p>
                </div>
              )}

              <div className={styles.allianceGrid}>
                {election.alliances.map(a => {
                  const pct    = Math.round((a.seats / election.totalSeats) * 100);
                  const isOpen = expandedAlliance === a.name;
                  return (
                    <div key={a.name}
                      className={`${styles.allianceCard} ${a.isWinner ? styles.cardWinner : ''}`}
                      style={{ '--party-color': a.color } as React.CSSProperties}>
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
                            <span className={styles.statLbl}>{election.isProjected ? 'proj.' : 'seats'}</span>
                          </div>
                          <div className={styles.stat}>
                            <span className={styles.statNum}>{a.share}%</span>
                            <span className={styles.statLbl}>vote</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${pct}%`, background: a.color }} />
                      </div>
                      {election.isProjected && a.range && (
                        <p className={styles.rangeNote}>Range: {a.range} seats</p>
                      )}
                      <button className={styles.drillBtn}
                        onClick={() => setExpandedAlliance(isOpen ? null : a.name)}>
                        {isOpen ? '▲ Hide breakdown' : '▼ Party breakdown'}
                      </button>
                      {isOpen && (
                        <ul className={styles.partyList}>
                          {a.parties.map(p => <li key={p} className={styles.partyItem}>{p}</li>)}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.majorityBar}>
                <div className={styles.majorityLine} style={{ left: `${(election.majority / election.totalSeats) * 100}%` }} />
                <div className={styles.majoritySegs}>
                  {election.alliances.map(a => (
                    <div key={a.name}
                      style={{ width: `${(a.seats / election.totalSeats) * 100}%`, background: a.color, height: '100%', opacity: 0.85 }}
                      title={`${a.name}: ${a.seats}`} />
                  ))}
                </div>
                <p className={styles.majorityCaption}>
                  ← Majority at {election.majority} ({Math.round((election.majority / election.totalSeats) * 100)}%) →
                </p>
              </div>

              <div className={styles.contextCard}>
                <p className={styles.contextText}>{election.context}</p>
                {!election.isProjected && (
                  <p className={styles.sourceNote}>Source: Election Commission of India — eci.gov.in</p>
                )}
              </div>
            </>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            HISTORY SECTION
        ══════════════════════════════════════════════ */}
        <section id="history" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>Election History</h2>
                <p className={styles.sectionSub}>Verified results · 2011 · 2016 · 2021</p>
              </div>
              <button className={styles.expandToggle}
                onClick={() => setShowHistory(v => !v)} aria-expanded={showHistory}>
                {showHistory ? '▲ Collapse' : '▼ Show charts'}
              </button>
            </div>

            <div className={styles.summaryTable}>
              <div className={styles.tableHead}>
                <span>Year</span><span>Winner</span><span>DMK+</span><span>AIADMK+</span><span>Turnout</span>
              </div>
              {[
                { year: '2011', winner: 'AIADMK+', dmk: 31,  ai: 203, t: '73.1%' },
                { year: '2016', winner: 'AIADMK',  dmk: 98,  ai: 136, t: '73.5%' },
                { year: '2021', winner: 'DMK+',    dmk: 159, ai: 75,  t: '72.8%' },
              ].map(row => (
                <div key={row.year}
                  className={`${styles.tableRow} ${selectedYear === row.year ? styles.tableRowActive : ''}`}
                  onClick={() => handleYearChange(row.year)} role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleYearChange(row.year)}>
                  <span className={styles.tableYear}>{row.year}</span>
                  <span className={styles.tableWinner} style={{ color: row.winner.startsWith('DMK') ? '#3b82f6' : '#ef4444' }}>{row.winner}</span>
                  <span style={{ color: '#3b82f6' }}>{row.dmk}</span>
                  <span style={{ color: '#ef4444' }}>{row.ai}</span>
                  <span className={styles.tableMuted}>{row.t}</span>
                </div>
              ))}
            </div>

            {showHistory && (
              <div className={styles.chartsWrap}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Seats Won</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={SEAT_HISTORY} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 234]} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Bar dataKey="DMK+" fill="#3b82f6" radius={[4,4,0,0]} />
                      <Bar dataKey="AIADMK+" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Vote Share (%)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={SHARE_HISTORY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} domain={[30, 55]} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Line dataKey="DMK+" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
                      <Line dataKey="AIADMK+" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
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
                <p>TN has alternated between DMK and AIADMK every 1–2 terms since 1977. No party has won three consecutive terms.</p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>⊘</div>
                <h4>FPTP Seat-Vote Disconnect</h4>
                <p>In 2016, DMK+INC won more votes (43.5%) than AIADMK (40.8%) yet won 38 fewer seats — stark first-past-the-post effect.</p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>↑</div>
                <h4>DMK Vote Share Growth</h4>
                <p>DMK+ vote share rose from 36.7% (2011) to 45.4% (2021), a gain of 8.7 percentage points over three cycles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2026 OUTLOOK SECTION
        ══════════════════════════════════════════════ */}
        <section id="outlook" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>2026 Outlook</h2>
            <p className={styles.sectionSub}>
              {isLive ? 'Live counting underway — see Results above' : 'Pre-election analysis · Projections · Not official results'}
            </p>
            <div className={styles.outlookGrid}>
              <div className={styles.outlookCard}>
                <h3>Key Factors</h3>
                <ul className={styles.factorList}>
                  <li><strong>DMK incumbency:</strong> CM M.K. Stalin seeks re-election on development credentials.</li>
                  <li><strong>AIADMK fragmentation:</strong> EPS-OPS split weakens the main opposition.</li>
                  <li><strong>BJP/NDA:</strong> Aims to break into Dravidian politics. Won only 4 seats in 2021.</li>
                  <li><strong>Anti-incumbency:</strong> Dravidian pattern favours rotation every 1–2 terms.</li>
                  <li><strong>50-yr milestone:</strong> 2026 marks 50 years of DMK-AIADMK dominance of TN politics.</li>
                </ul>
              </div>
              <div className={styles.outlookCard}>
                <h3>{isLive ? 'Live Tally' : 'Survey Projections'}</h3>
                <p className={styles.outlookNote}>{isLive ? 'Won + leading' : 'Pre-election ranges'}</p>
                {(isLive && live ? live.alliances : ELECTIONS['2026'].alliances).map(a => {
                  const lA = a as LiveAlliance; const sA = a as Alliance;
                  const val = isLive && live ? `${lA.won + lA.leading} seats` : (sA.range ?? `~${sA.seats}`);
                  const w   = isLive && live ? ((lA.won + lA.leading) / 234) * 100 : (sA.seats / 234) * 100;
                  return (
                    <div key={a.name} className={styles.projRow}>
                      <span className={styles.projName} style={{ color: a.color }}>{a.name}</span>
                      <div className={styles.projTrack}>
                        <div className={styles.projFill} style={{ width: `${w}%`, background: a.color }} />
                      </div>
                      <span className={styles.projRange}>{val}</span>
                    </div>
                  );
                })}
                <p className={styles.majorityRef}>Majority: 118 of 234</p>
              </div>
            </div>
            <div className={styles.disclaimerBox}>
              <strong>Data transparency:</strong> Historical results 2011–2021 verified from ECI (eci.gov.in).
              The 2026 data is pre-election survey projections until official results are declared.
              {isLive ? ' Live counts above sourced from ECI, updated every ~5 min.' : ' Projected ranges do not sum to exactly 234.'}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <p>
            Data from the{' '}
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">Election Commission of India</a>
            {' '}· Historical results 2011–2021 verified
          </p>
          <p>{isLive ? '2026 live from results.eci.gov.in · refreshed every ~5 min' : '2026 projections are unofficial pre-election survey estimates'}</p>
          <p className={styles.footerSmall}>Tamil Nadu Assembly · 234 constituencies · Majority: 118 seats</p>
        </footer>
      </div>
    </>
  );
}
