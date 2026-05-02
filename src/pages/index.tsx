import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import YearSelector from '../components/YearSelector';
import Leaderboard from '../components/Leaderboard';
import LiveSummary from '../components/LiveSummary';
import PredictionPanel from '../components/PredictionPanel';
import Predictions from '../components/Predictions';
import PartyCard from '../components/PartyCard';
import LiveTrends from '../components/LiveTrends';
import ConstituencyMap from '../components/ConstituencyMap';
import ConstituencyAnalytics from '../components/ConstituencyAnalytics';
import useElectionData from '../hooks/useElectionData';
import { getPartyData } from '../data/electionData';
import styles from '../styles/Home.module.css';

type ExpandedSections = {
  predictions: boolean;
  analytics: boolean;
  parties: boolean;
  constituencies: boolean;
};

export default function Home() {
  const parties = getPartyData();
  const [selectedYear, setSelectedYear] = useState('2026');
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    predictions: true,
    analytics: false,
    parties: false,
    constituencies: false
  });
  const electionData = useElectionData(selectedYear);

  const availableYears = ['2011', '2016', '2021', '2026'];

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Tamil Nadu Election Results {selectedYear} - Live Dashboard</title>
        <meta
          name="description"
          content={`Tamil Nadu assembly election results for ${selectedYear}. ${selectedYear === '2026' ? 'Live' : 'Historical'} seat counts, vote share, and constituency-wise data.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* YEAR SELECTOR */}
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
      />

      {/* HERO SECTION WITH LIVE COUNTDOWN */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.liveBadge}>
            <div className={styles.pulseDot}></div>
            <span>{selectedYear === '2026' ? 'LIVE ELECTION RESULTS' : `${selectedYear} RESULTS`}</span>
          </div>
          <h1>{selectedYear} Tamil Nadu Assembly Elections</h1>
          <p className={styles.heroSubtitle}>
            {selectedYear === '2026'
              ? 'Real-time leaderboard and comprehensive election analytics'
              : 'Historical election results and analysis'
            }
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{electionData.live.reportedSeats}</span>
              <span className={styles.statLabel}>Seats Counted</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{electionData.live.totalSeats - electionData.live.reportedSeats}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{electionData.live.turnout?.toFixed(1) ?? '—'}%</span>
              <span className={styles.statLabel}>Turnout</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* REAL-TIME LEADERBOARD - ALWAYS VISIBLE */}
        <section className={styles.leaderboardSection}>
          <Leaderboard data={electionData.live} />
        </section>

        {/* COLLAPSIBLE SECTIONS */}
        <div className={styles.mobileSections}>
          {/* PREDICTIONS SECTION - Only for current year */}
          {selectedYear === '2026' && electionData.predictions && (
            <div className={styles.collapsibleSection}>
              <button
                className={styles.sectionToggle}
                onClick={() => toggleSection('predictions')}
                aria-expanded={expandedSections.predictions}
              >
                <div className={styles.toggleHeader}>
                  <div className={styles.toggleIcon}>🔮</div>
                  <div className={styles.toggleContent}>
                    <h3>AI Predictions</h3>
                    <p>Live forecast and analysis</p>
                  </div>
                  <div className={`${styles.toggleArrow} ${expandedSections.predictions ? styles.expanded : ''}`}>
                    ▼
                  </div>
                </div>
              </button>
              {expandedSections.predictions && (
                <div className={styles.sectionContent}>
                  <Predictions data={electionData.live} predictions={electionData.predictions} />
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS SECTION */}
          <div className={styles.collapsibleSection}>
            <button
              className={styles.sectionToggle}
              onClick={() => toggleSection('analytics')}
              aria-expanded={expandedSections.analytics}
            >
              <div className={styles.toggleHeader}>
                <div className={styles.toggleIcon}>📊</div>
                <div className={styles.toggleContent}>
                  <h3>{selectedYear === '2026' ? 'Live Analytics' : 'Election Analysis'}</h3>
                  <p>Trends and insights</p>
                </div>
                <div className={`${styles.toggleArrow} ${expandedSections.analytics ? styles.expanded : ''}`}>
                  ▼
                </div>
              </div>
            </button>
            {expandedSections.analytics && (
              <div className={styles.sectionContent}>
                <div className={styles.analyticsGrid}>
                  <LiveTrends data={electionData.live} constituencies={electionData.constituencies} />
                  <PredictionPanel data={electionData.live} />
                </div>
              </div>
            )}
          </div>

          {/* PARTY PERFORMANCE */}
          <div className={styles.collapsibleSection}>
            <button
              className={styles.sectionToggle}
              onClick={() => toggleSection('parties')}
              aria-expanded={expandedSections.parties}
            >
              <div className={styles.toggleHeader}>
                <div className={styles.toggleIcon}>🏛️</div>
                <div className={styles.toggleContent}>
                  <h3>Party Performance</h3>
                  <p>Alliance breakdown</p>
                </div>
                <div className={`${styles.toggleArrow} ${expandedSections.parties ? styles.expanded : ''}`}>
                  ▼
                </div>
              </div>
            </button>
            {expandedSections.parties && (
              <div className={styles.sectionContent}>
                <div className={styles.partyGrid}>
                  {parties.map((party) => (
                    <PartyCard key={party.slug} party={party} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CONSTITUENCY RESULTS */}
          <div className={styles.collapsibleSection}>
            <button
              className={styles.sectionToggle}
              onClick={() => toggleSection('constituencies')}
              aria-expanded={expandedSections.constituencies}
            >
              <div className={styles.toggleHeader}>
                <div className={styles.toggleIcon}>🗺️</div>
                <div className={styles.toggleContent}>
                  <h3>Constituency Results</h3>
                  <p>All 234 constituencies</p>
                </div>
                <div className={`${styles.toggleArrow} ${expandedSections.constituencies ? styles.expanded : ''}`}>
                  ▼
                </div>
              </div>
            </button>
            {expandedSections.constituencies && (
              <div className={styles.sectionContent}>
                <ConstituencyMap constituencies={electionData.constituencies} />
                <ConstituencyAnalytics constituencies={electionData.constituencies} />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <section className={styles.bottomNav}>
          <Link href="/history" className={styles.navLink}>
            <div className={styles.navIcon}>📚</div>
            <span>Historical Data</span>
          </Link>
          <a href="#top" className={styles.navLink} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className={styles.navIcon}>⬆️</div>
            <span>Back to Top</span>
          </a>
        </section>
      </main>
    </div>
  );
}
