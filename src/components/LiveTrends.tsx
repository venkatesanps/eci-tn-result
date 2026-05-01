import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ConstituencyResult, LiveData } from '../data/electionData';
import styles from '../styles/Home.module.css';

const COLORS = ['#1d4ed8', '#dc2626', '#64748b'];

interface Props {
  data: LiveData;
  constituencies: ConstituencyResult[];
}

export default function LiveTrends({ data, constituencies }: Props) {
  const seatRemaining = data.totalSeats - data.reportedSeats;
  const topBattles = constituencies
    .filter((seat) => seat.status === 'counting' || seat.status === 'tight race')
    .slice(0, 4);

  const pieData = data.voteShare.map((entry) => ({ name: entry.party, value: entry.share }));

  return (
    <div className={styles.analyticsGrid}>
      <div className={styles.card}>
        <h3>Vote share distribution</h3>
        <div className={styles.chartBlock}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className={styles.pieCenter}>
                {data.reportedSeats}/{data.totalSeats}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Live forecast details</h3>
        <div className={styles.metricCard}>
          <p>Seats remaining</p>
          <p className={styles.large}>{seatRemaining}</p>
        </div>
        <div className={styles.metricCard}>
          <p>Election turnout</p>
          <p className={styles.large}>{data.turnout ?? 0}%</p>
        </div>
        <div className={styles.metricCard}>
          <p>Last updated</p>
          <p>{data.lastUpdated ?? 'Sample data'}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Key battlegrounds</h3>
        <ul className={styles.list}>
          {topBattles.length === 0 ? (
            <li>No close battlegrounds in sample data.</li>
          ) : (
            topBattles.map((seat) => (
              <li key={seat.name}>
                <strong>{seat.name}</strong> — {seat.party} lead by {seat.margin}% ({seat.status})
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
