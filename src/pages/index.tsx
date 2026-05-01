import Head from 'next/head';
import Link from 'next/link';
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
        <title>Tamil Nadu Election Dashboard</title>
        <meta
          name="description"
          content="Live Tamil Nadu election results, projections, and analytics."
        />
      </Head>

      <header className={styles.hero}>
        <div>
          <p className={styles.badge}>Tamil Nadu Assembly Election</p>
          <h1>Live results and prediction analytics</h1>
          <p className={styles.lead}>
            Real-time seat counts, vote share trends, and constituency-level insights for the latest TN assembly election.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/history" className={styles.button}>Historical analytics</Link>
          <a href="#predictions" className={styles.buttonSecondary}>Prediction panel</a>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.topSection}>
          <LiveSummary data={live} />
          <PredictionPanel data={live} />
        </section>

        <section className={styles.partySection}>
          <div className={styles.sectionHeader}>
            <h2>Party strength snapshot</h2>
            <p>Compare leading parties based on seats won, vote share, and momentum.</p>
          </div>
          <div className={styles.partyGrid}>
            {parties.map((party) => (
              <PartyCard key={party.slug} party={party} />
            ))}
          </div>
        </section>

        <section className={styles.analyticsSection}>
          <div className={styles.sectionHeader}>
            <h2>Live analytics</h2>
            <p>Instant insights from reported vote share, turnout, and critical battleground seats.</p>
          </div>
          <LiveTrends data={live} constituencies={constituencies} />
        </section>

        <ConstituencyMap constituencies={constituencies} />
        <ConstituencyAnalytics constituencies={constituencies} />

        <section className={styles.browseSection}>
          <h2>More analytics</h2>
          <div className={styles.linksGrid}>
            <Link href="/history" className={styles.linkCard}>
              <h3>Historical elections</h3>
              <p>View prior result cycles, vote swings, and demographic comparisons.</p>
            </Link>
            <a href="#predictions" className={styles.linkCard}>
              <h3>Real-time predictions</h3>
              <p>Live forecast summary based on available seat counts and remaining constituencies.</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
