import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { getPartyData, getPartyPaths, PartyData } from '../../data/electionData';
import styles from '../../styles/Home.module.css';

interface Props {
  party: PartyData;
}

export default function PartyPage({ party }: Props) {
  return (
    <div className={styles.page}>
      <Head>
        <title>{party.name} analytics</title>
      </Head>
      <header className={styles.heroSmall}>
        <div>
          <h1>{party.name}</h1>
          <p>{party.description}</p>
          <Link href="/" className={styles.button}>Back to dashboard</Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.partyDetail}>
          <div className={styles.metricCard}>
            <h3>Seats won</h3>
            <p className={styles.large}>{party.seats}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Vote share</h3>
            <p className={styles.large}>{party.voteShare}%</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Momentum</h3>
            <p className={styles.large}>{party.momentum}</p>
          </div>
        </section>

        <section className={styles.partySummary}>
          <h2>Party strength</h2>
          <p>{party.summary}</p>
        </section>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getPartyPaths(),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const party = getPartyData().find((item) => item.slug === slug);

  if (!party) {
    return { notFound: true };
  }

  return {
    props: {
      party,
    },
  };
};
