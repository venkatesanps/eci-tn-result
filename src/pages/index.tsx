import Head from 'next/head';
import Link from 'next/link';
import Leaderboard from '../components/Leaderboard';
import LiveSummary from '../components/LiveSummary';
import PredictionPanel from '../components/PredictionPanel';
import PartyCard from '../components/PartyCard';
import LiveTrends from '../components/LiveTrends';
import ConstituencyMap from '../components/ConstituencyMap';
import ConstituencyAnalytics from '../components/ConstituencyAnalytics';
import useLiveData from '../hooks/useLiveData';
import { getPartyData } from '../data/electionData';
import styles from '../styles/Home.module.css';

export default function Home() {
  const parties = getPartyData();
  const { live, constituencies } = useLiveData();

  return (
    <div className={styles.page}>
      <Head>
        <title>2026 Tamil Nadu Election Results - Live Leaderboard</title>
        <meta
          name="description"
          content="Live 2026 Tamil Nadu assembly election results. Real-time leaderboard, seat counts, vote share, and constituency-wise data."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* HERO SECTION WITH LIVE COUNTDOWN */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.liveBadge}>
            <div className={styles.pulseDot}></div>
            <span>LIVE ELECTION RESULTS</span>
          </div>
          <h1>2026 Tamil Nadu Assembly Elections</h1>
          <p className={styles.heroSubtitle}>
            Real-time leaderboard and comprehensive election analytics
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{live.reportedSeats}</span>
              <span className={styles.statLabel}>Seats Counted</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{live.totalSeats - live.reportedSeats}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{live.turnout?.toFixed(1) ?? '—'}%</span>
              <span className={styles.statLabel}>Turnout</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* REAL-TIME LEADERBOARD - MAIN FEATURE */}
        <section className={styles.leaderboardSection}>
          <Leaderboard data={live} />
        </section>

        {/* SECONDARY SECTIONS */}
        <section className={styles.secondarySection}>
          <div className={styles.secondaryGrid}>
            {/* LIVE ANALYTICS */}
            <div className={styles.secondaryCard}>
              <h3>Live Analytics & Trends</h3>
              <LiveTrends data={live} constituencies={constituencies} />
            </div>

            {/* PREDICTIONS */}
            <div className={styles.secondaryCard}>
              <h3>Election Predictions</h3>
              <PredictionPanel data={live} />
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
          <ConstituencyMap constituencies={constituencies} />
          <ConstituencyAnalytics constituencies={constituencies} />
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
