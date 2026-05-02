import React from 'react';
import { LiveData } from '../data/electionData';
import styles from '../styles/Predictions.module.css';

interface PredictionsProps {
  data: LiveData;
  predictions?: {
    projectedWinner: string;
    confidence: number;
    projectedSeats: { [party: string]: number };
  };
}

const Predictions: React.FC<PredictionsProps> = ({ data, predictions }) => {
  if (!predictions) return null;

  const remainingSeats = data.totalSeats - data.reportedSeats;
  const progressPercent = Math.round((data.reportedSeats / data.totalSeats) * 100);
  const majorityMark = Math.ceil(data.totalSeats / 2) + 1;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className={styles.predictions}>
      <div className={styles.header}>
        <h3>🤖 AI Predictions</h3>
        <p>Based on current trends and historical patterns</p>
      </div>

      <div className={styles.predictionGrid}>
        {/* MAIN PREDICTION CARD */}
        <div className={styles.mainPrediction}>
          <div className={styles.winnerCard}>
            <div className={styles.trophy}>🏆</div>
            <div className={styles.winnerInfo}>
              <h4>Projected Winner</h4>
              <div className={styles.winnerName}>{predictions.projectedWinner}</div>
              <div className={styles.confidence}>
                <div
                  className={styles.confidenceBar}
                  style={{
                    width: `${predictions.confidence}%`,
                    backgroundColor: getConfidenceColor(predictions.confidence)
                  }}
                ></div>
                <span className={styles.confidenceText}>
                  {predictions.confidence}% - {getConfidenceLabel(predictions.confidence)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PROJECTED SEATS */}
        <div className={styles.seatsProjection}>
          <h4>Projected Final Seats</h4>
          <div className={styles.seatsGrid}>
            {Object.entries(predictions.projectedSeats).map(([party, seats]) => (
              <div key={party} className={styles.seatProjection}>
                <span className={styles.partyName}>{party}</span>
                <span className={styles.projectedSeats}>{seats}</span>
                {seats >= majorityMark && (
                  <span className={styles.majorityBadge}>MAJORITY</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PREDICTION FACTORS */}
        <div className={styles.factors}>
          <h4>Key Factors</h4>
          <div className={styles.factorList}>
            <div className={styles.factor}>
              <span className={styles.factorIcon}>📊</span>
              <div className={styles.factorText}>
                <strong>Current Lead:</strong> {data.leadingParties[0]?.seats - (data.leadingParties[1]?.seats || 0)} seats
              </div>
            </div>
            <div className={styles.factor}>
              <span className={styles.factorIcon}>🎯</span>
              <div className={styles.factorText}>
                <strong>Remaining:</strong> {remainingSeats} seats ({100 - progressPercent}% of total)
              </div>
            </div>
            <div className={styles.factor}>
              <span className={styles.factorIcon}>📈</span>
              <div className={styles.factorText}>
                <strong>Momentum:</strong> {data.leadingParties[0]?.momentum > 0 ? 'Positive' : 'Negative'} trend
              </div>
            </div>
            <div className={styles.factor}>
              <span className={styles.factorIcon}>👥</span>
              <div className={styles.factorText}>
                <strong>Turnout:</strong> {data.turnout?.toFixed(1)}% (higher than usual)
              </div>
            </div>
          </div>
        </div>

        {/* UNCERTAINTY NOTICE */}
        <div className={styles.disclaimer}>
          <div className={styles.disclaimerIcon}>⚠️</div>
          <div className={styles.disclaimerText}>
            <strong>Disclaimer:</strong> These predictions are based on current data and historical patterns.
            Actual results may vary due to various factors including voter turnout, last-minute changes,
            and unforeseen circumstances.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;