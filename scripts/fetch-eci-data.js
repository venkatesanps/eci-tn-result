import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'public', 'data');
const liveFile = path.join(dataDir, 'live-summary.json');
const partyFile = path.join(dataDir, 'party-data.json');
const constituencyFile = path.join(dataDir, 'constituencies.json');

const candidateSources = [
  process.env.ECI_LIVE_API,
  'https://results.eci.gov.in/Result2026/StatewiseU05.htm?st=U05',
  'https://results.eci.gov.in/Result2026/StatewiseS26.htm?st=S26',
  'https://results.eci.gov.in/Result2026/StatewiseS26.json',
].filter(Boolean);

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchLiveData() {
  for (const sourceUrl of candidateSources) {
    console.log(`Trying live data source: ${sourceUrl}`);
    try {
      const json = await fetchJson(sourceUrl);
      console.log(`Loaded live data from ${sourceUrl}`);
      return json;
    } catch (error) {
      console.warn(`Source ${sourceUrl} failed:`, error.message ?? error);
    }
  }

  console.warn('No live ECI JSON source was found. Falling back to sample data.');
  return null;
}

async function main() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const liveData = await fetchLiveData();
  if (liveData) {
    fs.writeFileSync(liveFile, JSON.stringify(liveData, null, 2));
    console.log(`Updated ${liveFile}`);
    if (liveData.constituencies) {
      fs.writeFileSync(constituencyFile, JSON.stringify(liveData.constituencies, null, 2));
      console.log(`Updated ${constituencyFile}`);
    }
  } else {
    console.log(`No live update performed. Sample data remains in ${liveFile}`);
  }

  if (!fs.existsSync(partyFile)) {
    const fallbackParties = [
      {
        slug: 'dmk',
        name: 'DMK+',
        seats: 126,
        voteShare: 42.5,
        momentum: 0.76,
        summary: 'Front-runner alliance with strong growth across urban and rural constituencies.',
        description: 'The DMK-led alliance is currently ahead in seat count and vote share, showing momentum across key districts.',
      },
      {
        slug: 'aiadmk',
        name: 'AIADMK+',
        seats: 68,
        voteShare: 35.8,
        momentum: -0.34,
        summary: 'Main opposition alliance with a focus on retaining traditional strongholds.',
        description: 'AIADMK remains the principal opposition force, seeking to consolidate remaining constituencies and boost vote share.',
      },
    ];
    fs.writeFileSync(partyFile, JSON.stringify(fallbackParties, null, 2));
    console.log(`Created sample party data at ${partyFile}`);
  }

  if (!fs.existsSync(constituencyFile)) {
    console.log(`No constituency file found at ${constituencyFile}. Keeping sample data.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
