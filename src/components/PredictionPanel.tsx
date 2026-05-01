import type { LiveData } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  data: LiveData;
}

function calculatePrediction(data: LiveData) {
  const remaining = data.totalSeats - data.reportedSeats;
  const estimatedGain = Math.round((data.leadingParties[0]?.momentum || 0) * remaining * 0.5);
  const projectedSeats = Math.min(data.leadingParties[0]?.seats + estimatedGain, data.totalSeats);
  const majority = Math.ceil(data.totalSeats / 2);
  return {
    projectedSeats,
    majority,
    probability: Math.min(95, Math.max(45, 50 + (data.leadingParties[0]?.momentum || 0) * 20)),
  };
}

export default function PredictionPanel({ data }: Props) {
  const prediction = calculatePrediction(data);

  return (
    <section id="predictions" className={styles.cardGroup}>
      <div className={styles.card}>
        <h3>Current forecast</h3>
        <p className={styles.large}>{prediction.projectedSeats} seats</p>
        <p>{prediction.majority} seats needed for majority</p>
      </div>
      <div className={styles.card}>
        <h3>Win probability</h3>
        <p className={styles.large}>{prediction.probability}%</p>
        <p>Based on reported counts and current momentum</p>
      </div>
      <div className={styles.card}>
        <h3>Summary</h3>
        <p>
          With {data.reportedSeats} seats reported, the leading block is trending toward a comfortable majority if the current pattern continues.
        </p>
      </div>
    </section>
  );
}
