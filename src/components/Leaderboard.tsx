import React, { useEffect, useState } from 'react';
import { LeaderParty, LiveData } from '../data/electionData';
import styles from '../styles/Leaderboard.module.css';

interface LeaderboardProps {
  data: LiveData;
  autoRefresh?: boolean;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      const startValue = displayValue;
      const difference = value - startValue;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + difference * easeOut);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration, displayValue]);

  return (
    <span className={`${styles.animatedNumber} ${isAnimating ? styles.animating : ''}`}>
      {displayValue.toLocaleString()}
    </span>
  );
};

const Leaderboard: React.FC<LeaderboardProps> = ({ data, autoRefresh = true }) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isLive, setIsLive] = useState(true);

  const seatsForMajority = Math.ceil(data.totalSeats / 2) + 1;
  const progress = Math.round(((data.reportedSeats ?? data.reported ?? 0) / data.totalSeats) * 100);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(Date.now());
        setIsLive(prev => !prev); // Toggle for pulse effect
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getPartyColor = (partyName: string) => {
    if (partyName.includes('DMK')) return '#2563eb';
    if (partyName.includes('AIADMK')) return '#dc2626';
    return '#64748b';
  };

  const getMomentumIcon = (momentum: number) => {
    if (momentum > 0.5) return '📈';
    if (momentum < -0.5) return '📉';
    return '➡️';
  };

  return (
    <div className={styles.leaderboard}>
      {/* LIVE HEADER */}
      <div className={styles.header}>
        <div className={styles.liveIndicator}>
          <div className={`${styles.pulse} ${isLive ? styles.active : ''}`}></div>
          <span className={styles.liveText}>LIVE</span>
          <span className={styles.updateTime}>
            Updated {new Date(data.lastUpdated || '').toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour12: true
            })}
          </span>
        </div>
        <h1 className={styles.title}>2026 Tamil Nadu Election Leaderboard</h1>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            {data.reportedSeats} of {data.totalSeats} seats counted ({progress}%)
          </span>
        </div>
      </div>

      {/* LEADERBOARD GRID */}
      <div className={styles.grid}>
        {data.leadingParties.map((party, index) => {
          const rank = index + 1;
          const voteShare = data.voteShare.find(vs => vs.party === party.name);
          const isLeading = party.seats >= seatsForMajority;
          const partyColor = getPartyColor(party.name);

          return (
            <div
              key={party.name}
              className={`${styles.card} ${isLeading ? styles.leading : ''} ${rank === 1 ? styles.first : ''}`}
              style={{ '--party-color': partyColor } as React.CSSProperties}
            >
              {/* RANK BADGE */}
              <div className={styles.rankBadge}>
                <span className={styles.rankIcon}>{getRankIcon(rank)}</span>
                <span className={styles.rankNumber}>{rank}</span>
              </div>

              {/* PARTY INFO */}
              <div className={styles.partyInfo}>
                <h3 className={styles.partyName}>{party.name}</h3>
                <div className={styles.partyStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Seats</span>
                    <AnimatedNumber value={party.seats} />
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Vote %</span>
                    <span className={styles.votePercent}>
                      {voteShare?.share.toFixed(1) ?? '—'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* MOMENTUM INDICATOR */}
              <div className={styles.momentum}>
                <div className={`${styles.momentumBar} ${party.momentum > 0 ? styles.positive : styles.negative}`}>
                  <div
                    className={styles.momentumFill}
                    style={{ width: `${Math.abs(party.momentum * 100)}%` }}
                  ></div>
                </div>
                <span className={styles.momentumIcon}>
                  {getMomentumIcon(party.momentum)}
                </span>
              </div>

              {/* STATUS BADGE */}
              <div className={styles.status}>
                {isLeading ? (
                  <span className={styles.majorityBadge}>
                    🎯 MAJORITY
                  </span>
                ) : (
                  <span className={styles.trailingBadge}>
                    {seatsForMajority - party.seats} needed
                  </span>
                )}
              </div>

              {/* PROGRESS RING */}
              <div className={styles.progressRing}>
                <svg className={styles.ring} viewBox="0 0 36 36">
                  <path
                    className={styles.ringBg}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={styles.ringFill}
                    strokeDasharray={`${(party.seats / seatsForMajority) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={styles.ringText}>
                  {Math.round((party.seats / seatsForMajority) * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY STATS */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Majority Mark</span>
          <span className={styles.summaryValue}>{seatsForMajority} seats</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Turnout</span>
          <span className={styles.summaryValue}>{data.turnout?.toFixed(1) ?? '—'}%</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Pending Results</span>
          <span className={styles.summaryValue}>{data.totalSeats - data.reportedSeats}</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;