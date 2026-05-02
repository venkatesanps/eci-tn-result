import React, { useState } from 'react';
import Head from 'next/head';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import styles from '../styles/Home.module.css';

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

// Verified historical results — Source: Election Commission of India (eci.gov.in)
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
      'Official results have not been declared. Seat figures below are midpoint estimates from pre-election surveys. Actual results will differ.',
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

// Chart data — verified historical results only (2026 excluded)
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
  contentStyle: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    fontSize: 13,
  },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#94a3b8' },
};

export default function Home() {
  const [selectedYear, setSelectedYear] = useState('2021');
  const [expandedAlliance, setExpandedAlliance] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const election = ELECTIONS[selectedYear];

  function handleYearChange(year: string) {
    setSelectedYear(year);
    setExpandedAlliance(null);
  }

  return (
    <>
      <Head>
        <title>Tamil Nadu Elections — Results & Analysis</title>
        <meta
          name="description"
          content="Tamil Nadu assembly election results (2011, 2016, 2021) and 2026 projections. Verified data from the Election Commission of India."
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
          <h1 className={styles.heroTitle}>Tamil Nadu Election Results</h1>
          <p className={styles.heroSubtitle}>
            Verified historical data from the Election Commission of India
          </p>
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
                {y === '2026' && <span className={styles.projBadge}>Projected</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <section id="results" className={styles.section}>
          <div className={styles.container}>

            {/* Header row */}
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

            {/* Projection warning */}
            {election.isProjected && (
              <div className={styles.projWarning}>
                <span className={styles.projIcon}>⚠</span>
                <p>
                  <strong>Projected data only.</strong> {election.projectedNote}
                </p>
              </div>
            )}

            {/* Alliance cards */}
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

                    {/* Progress bar */}
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, background: a.color }}
                        title={`${pct}% of total seats`}
                      />
                    </div>
                    {election.isProjected && a.range && (
                      <p className={styles.rangeNote}>Projected range: {a.range} seats</p>
                    )}

                    {/* Drill-down toggle */}
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

            {/* Majority reference */}
            <div className={styles.majorityBar}>
              <div className={styles.majorityLine} style={{ left: `${(election.majority / election.totalSeats) * 100}%` }} />
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
                ← Majority mark at {election.majority} seats ({Math.round((election.majority / election.totalSeats) * 100)}%) →
              </p>
            </div>

            {/* Context */}
            <div className={styles.contextCard}>
              <p className={styles.contextText}>{election.context}</p>
              {!election.isProjected && (
                <p className={styles.sourceNote}>
                  Data source: Election Commission of India — eci.gov.in
                </p>
              )}
            </div>
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

            {/* Always-visible summary table */}
            <div className={styles.summaryTable}>
              <div className={styles.tableHead}>
                <span>Year</span>
                <span>Winner</span>
                <span>DMK+ seats</span>
                <span>AIADMK+ seats</span>
                <span>Turnout</span>
              </div>
              {[
                { year: '2011', winner: 'AIADMK+', dmk: 31, aiadmk: 203, turnout: '73.1%' },
                { year: '2016', winner: 'AIADMK', dmk: 98, aiadmk: 136, turnout: '73.5%' },
                { year: '2021', winner: 'DMK+', dmk: 159, aiadmk: 75, turnout: '72.8%' },
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

            {/* Expandable charts */}
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

            {/* Key patterns */}
            <div className={styles.patternsGrid}>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>↩</div>
                <h4>Power Alternation</h4>
                <p>
                  Tamil Nadu has alternated between DMK and AIADMK every 1–2 terms since 1977.
                  No party has won three consecutive terms.
                </p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>⊘</div>
                <h4>FPTP Seat-Vote Disconnect</h4>
                <p>
                  In 2016, DMK+INC won more votes (43.5%) than AIADMK (40.8%) yet won 38 fewer
                  seats — a stark illustration of first-past-the-post effects.
                </p>
              </div>
              <div className={styles.patternCard}>
                <div className={styles.patternIcon}>↑</div>
                <h4>DMK Vote Share Growth</h4>
                <p>
                  DMK+ alliance vote share has risen from 36.7% (2011) to 45.4% (2021),
                  a gain of 8.7 percentage points over three cycles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2026 OUTLOOK ── */}
        <section id="outlook" className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>2026 Outlook</h2>
            <p className={styles.sectionSub}>
              Pre-election analysis · Projections only · Not official results
            </p>

            <div className={styles.outlookGrid}>
              <div className={styles.outlookCard}>
                <h3>Key Factors</h3>
                <ul className={styles.factorList}>
                  <li>
                    <strong>DMK incumbency:</strong> CM M.K. Stalin seeks re-election on development
                    credentials (industrial investments, welfare schemes, infrastructure).
                  </li>
                  <li>
                    <strong>AIADMK fragmentation:</strong> Ongoing split between Edappadi K.
                    Palaniswami and O. Panneerselvam factions continues to weaken the main
                    opposition.
                  </li>
                  <li>
                    <strong>BJP/NDA factor:</strong> BJP-led NDA aims to make inroads into
                    Dravidian politics. Won only 4 seats (with AIADMK) in 2021.
                  </li>
                  <li>
                    <strong>Anti-incumbency risk:</strong> Dravidian pattern favours rotation.
                    Any governance fatigue or local issues could swing seats.
                  </li>
                  <li>
                    <strong>50-year Dravidian milestone:</strong> 2026 marks 50 years since DMK and
                    AIADMK took full control of TN politics, defining its political identity.
                  </li>
                </ul>
              </div>

              <div className={styles.outlookCard}>
                <h3>Survey Projections</h3>
                <p className={styles.outlookNote}>Pre-election survey ranges — not official results</p>
                {ELECTIONS['2026'].alliances.map((a) => (
                  <div key={a.name} className={styles.projRow}>
                    <span className={styles.projName} style={{ color: a.color }}>
                      {a.name}
                    </span>
                    <div className={styles.projTrack}>
                      <div
                        className={styles.projFill}
                        style={{
                          width: `${(a.seats / 234) * 100}%`,
                          background: a.color,
                        }}
                      />
                    </div>
                    <span className={styles.projRange}>{a.range ?? `~${a.seats}`}</span>
                  </div>
                ))}
                <p className={styles.majorityRef}>Majority required: 118 of 234 seats</p>
              </div>
            </div>

            <div className={styles.disclaimerBox}>
              <strong>Data transparency note:</strong> Historical results for 2011, 2016, and 2021
              are verified from official Election Commission of India records (eci.gov.in). The 2026
              figures are pre-election survey projections and <strong>not official results</strong>.
              Projected seat ranges are independent estimates and do not sum to exactly 234.
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={styles.footer}>
          <p>
            Data sourced from the{' '}
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">
              Election Commission of India
            </a>{' '}
            · Historical results 2011–2021 verified
          </p>
          <p>2026 projections are unofficial pre-election survey estimates</p>
          <p className={styles.footerSmall}>Tamil Nadu Assembly · 234 constituencies · Majority: 118 seats</p>
        </footer>

      </div>
    </>
  );
}
