import type { ConstituencyResult } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  constituencies: ConstituencyResult[];
}

const partyColor: Record<string, string> = {
  'DMK+': '#1d4ed8',
  'AIADMK+': '#dc2626',
  Others: '#64748b',
};

export default function ConstituencyMap({ constituencies }: Props) {
  const displaySeats = constituencies.slice(0, 12);

  return (
    <section className={styles.mapSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Constituency heatmap</h2>
          <p>Interactive constituency snapshot with current winners, turnout, and margin intensity.</p>
        </div>
        <div className={styles.legendRow}>
          {Object.entries(partyColor).map(([party, color]) => (
            <div key={party} className={styles.legendItem}>
              <span className={styles.legendSwatch} style={{ backgroundColor: color }} />
              {party}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.mapGrid}>
        {displaySeats.map((seat) => (
          <div key={seat.name} className={styles.mapTile} style={{ borderColor: partyColor[seat.party] ?? '#94a3b8' }}>
            <strong>{seat.name}</strong>
            <p>{seat.party}</p>
            <p>{seat.turnout}% turnout</p>
            <p className={styles.margin}>{seat.margin}% margin</p>
          </div>
        ))}
      </div>
    </section>
  );
}
