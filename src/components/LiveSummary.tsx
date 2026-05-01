import type { LiveData } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  data: LiveData;
}

export default function LiveSummary({ data }: Props) {
  const progress = Math.round((data.reportedSeats / data.totalSeats) * 100);

  return (
    <section className={styles.cardGroup}>
      <div className={styles.card}>
        <h3>Election snapshot</h3>
        <p className={styles.large}>{data.reportedSeats}/{data.totalSeats}</p>
        <p>{progress}% of seats updated</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.smallText}>
          Turnout: {data.turnout?.toFixed(1) ?? '—'}%
          <br />
          Updated {data.lastUpdated ?? 'from sample data'}
        </p>
      </div>

      <div className={styles.card}>
        <h3>Leading parties</h3>
        <ul className={styles.list}>
          {data.leadingParties.map((party) => (
            <li key={party.name}>
              <strong>{party.name}:</strong> {party.seats} seats • momentum {party.momentum > 0 ? '+' : ''}{party.momentum}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h3>Vote share</h3>
        <div className={styles.statGrid}>
          {data.voteShare.map((item) => (
            <div key={item.party} className={styles.metricCard}>
              <p>{item.party}</p>
              <p className={styles.large}>{item.share}%</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
