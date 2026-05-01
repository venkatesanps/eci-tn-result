import Link from 'next/link';
import type { PartyData } from '../data/electionData';
import styles from '../styles/Home.module.css';

interface Props {
  party: PartyData;
}

export default function PartyCard({ party }: Props) {
  return (
    <Link href={`/party/${party.slug}`} className={styles.partyCard}>
      <div>
        <h3>{party.name}</h3>
        <p>{party.summary}</p>
      </div>
      <div className={styles.partyStats}>
        <span>{party.seats} seats</span>
        <span>{party.voteShare}%</span>
      </div>
    </Link>
  );
}
