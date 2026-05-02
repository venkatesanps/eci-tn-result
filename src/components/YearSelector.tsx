import React from 'react';
import styles from '../styles/YearSelector.module.css';

interface YearSelectorProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: string[];
}

const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears
}) => {
  const isCurrentYear = selectedYear === '2026';

  return (
    <div className={styles.yearSelector}>
      <div className={styles.selectorContainer}>
        <label htmlFor="year-select" className={styles.label}>
          Election Year:
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className={styles.select}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year} {year === '2026' ? '(Live)' : ''}
              </option>
            ))}
          </select>
          <div className={styles.selectArrow}>▼</div>
        </div>
        {isCurrentYear && (
          <div className={styles.liveIndicator}>
            <div className={styles.liveDot}></div>
            <span className={styles.liveText}>LIVE</span>
          </div>
        )}
      </div>

      {isCurrentYear && (
        <div className={styles.liveStatus}>
          <span className={styles.statusText}>
            Real-time data from Election Commission of India
          </span>
        </div>
      )}
    </div>
  );
};

export default YearSelector;