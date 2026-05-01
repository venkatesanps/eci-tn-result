import type { ConstituencyResult } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  constituencies: ConstituencyResult[];
}

function getRegionSummary(constituencies: ConstituencyResult[]) {
  const summary: Record<string, { seats: number; close: number; averageMargin: number }> = {};

  constituencies.forEach((constituency) => {
    const region = constituency.region || 'Unknown';
    if (!summary[region]) {
      summary[region] = { seats: 0, close: 0, averageMargin: 0 };
    }
    summary[region].seats += 1;
    if (constituency.margin <= 5) {
      summary[region].close += 1;
    }
    summary[region].averageMargin += constituency.margin;
  });

  return Object.entries(summary).map(([region, value]) => ({
    region,
    seats: value.seats,
    close: value.close,
    averageMargin: parseFloat((value.averageMargin / value.seats).toFixed(1)),
  }));
}

export default function ConstituencyAnalytics({ constituencies }: Props) {
  const regionSummary = getRegionSummary(constituencies);
  const closeContests = constituencies
    .filter((seat) => seat.margin <= 5)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 6);

  return (
    <section className={styles.analyticsSection}>
      <div className={styles.sectionHeader}>
        <h2>Constituency analytics</h2>
        <p>Detailed constituency-level insights by region, margin, and turnout.</p>
      </div>

      <div className={styles.summaryGrid}>
        {regionSummary.map((region) => (
          <div key={region.region} className={styles.metricCard}>
            <h4>{region.region}</h4>
            <p>{region.seats} seats tracked</p>
            <p>{region.close} close contests</p>
            <p>Avg margin {region.averageMargin}%</p>
          </div>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <h3>Closest races</h3>
        <table className={styles.analyticsTable}>
          <thead>
            <tr>
              <th>Constituency</th>
              <th>Region</th>
              <th>Current leader</th>
              <th>Margin</th>
              <th>Turnout</th>
            </tr>
          </thead>
          <tbody>
            {closeContests.map((seat) => (
              <tr key={seat.name}>
                <td>{seat.name}</td>
                <td>{seat.region}</td>
                <td>{seat.party}</td>
                <td>{seat.margin}%</td>
                <td>{seat.turnout}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
