import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import type { HistorySnapshot } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  history: HistorySnapshot[];
}

export default function HistoricalCharts({ history }: Props) {
  return (
    <div className={styles.chartsGrid}>
      <div className={styles.chartCard}>
        <h3>Vote share trends</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="dmkShare" stroke="#1d4ed8" />
            <Line type="monotone" dataKey="aiadmkShare" stroke="#dc2626" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.chartCard}>
        <h3>Seat share by cycle</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="dmkSeats" name="DMK" fill="#1d4ed8" />
            <Bar dataKey="aiadmkSeats" name="AIADMK" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
