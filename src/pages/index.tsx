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

export default function Home() {
  const parties = getPartyData();
  const [selectedYear, setSelectedYear] = useState('2026');
  const electionData = useElectionData(selectedYear);

  const availableYears = ['2011', '2016', '2021', '2026'];

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
        {/* REAL-TIME LEADERBOARD - MAIN FEATURE */}
        <section className={styles.leaderboardSection}>
          <Leaderboard data={electionData.live} />
        </section>

        {/* PREDICTIONS SECTION - Only for current year */}
        {selectedYear === '2026' && electionData.predictions && (
          <section className={styles.predictionsSection}>
            <Predictions data={electionData.live} predictions={electionData.predictions} />
          </section>
        )}

        {/* SECONDARY SECTIONS */}
        <section className={styles.secondarySection}>
          <div className={styles.secondaryGrid}>
            {/* LIVE ANALYTICS */}
            <div className={styles.secondaryCard}>
              <h3>{selectedYear === '2026' ? 'Live Analytics & Trends' : 'Election Analysis'}</h3>
              <LiveTrends data={electionData.live} constituencies={electionData.constituencies} />
            </div>

            {/* PREDICTIONS */}
            <div className={styles.secondaryCard}>
              <h3>Election Predictions</h3>
              <PredictionPanel data={electionData.live} />
            </div>
          </div>
        </section>

        {/* PARTY DETAILS */}
        <section className={styles.partySection}>
          <div className={styles.sectionHeader}>
            <h2>Party Performance</h2>
            <p>Detailed analysis of each major alliance</p>
          </div>
          <div className={styles.partyGrid}>
            {parties.map((party) => (
              <PartyCard key={party.slug} party={party} />
            ))}
          </div>
        </section>

        {/* CONSTITUENCY RESULTS */}
        <section className={styles.constituencySection} id="constituency">
          <div className={styles.sectionHeader}>
            <h2>Constituency Results</h2>
            <p>Detailed results from all 234 constituencies</p>
          </div>
          <ConstituencyMap constituencies={electionData.constituencies} />
          <ConstituencyAnalytics constituencies={electionData.constituencies} />
        </section>

        {/* NAVIGATION */}
        <section className={styles.navigationSection}>
          <div className={styles.sectionHeader}>
            <h2>Explore More</h2>
            <p>Additional election data and historical comparisons</p>
          </div>
          <div className={styles.navGrid}>
            <Link href="/history" className={styles.navCard}>
              <div className={styles.navIcon}>📊</div>
              <div className={styles.navContent}>
                <h3>Historical Results</h3>
                <p>Compare with previous elections</p>
              </div>
            </Link>
            <a href="#analytics" className={styles.navCard}>
              <div className={styles.navIcon}>📈</div>
              <div className={styles.navContent}>
                <h3>Advanced Analytics</h3>
                <p>Detailed voting patterns</p>
              </div>
            </a>
            <a href="#predictions" className={styles.navCard}>
              <div className={styles.navIcon}>🔮</div>
              <div className={styles.navContent}>
                <h3>Predictions</h3>
                <p>AI-powered outcome forecasts</p>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
