import Head from 'next/head';
import Link from 'next/link';
import HistoricalCharts from '../components/HistoricalCharts';
import { getHistoryData } from '../data/electionData';
import styles from '../styles/Home.module.css';

export default function History() {
  const history = getHistoryData();

  return (
    <div className={styles.page}>
      <Head>
        <title>Election History Analytics</title>
        <meta
          name="description"
          content="Historical Tamil Nadu election results and analytics for party strength and demographics."
        />
      </Head>

      <header className={styles.heroSmall}>
        <div>
          <h1>Historical election analytics</h1>
          <p>Explore prior Tamil Nadu assembly cycles, vote share trends, and party performance over time.</p>
          <Link href="/" className={styles.button}>Back to live dashboard</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.historySection}>
          <HistoricalCharts history={history} />
        </section>
      </main>
    </div>
  );
}
