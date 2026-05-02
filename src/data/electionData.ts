import liveSummary from '../../public/data/live-summary.json';
import partyData from '../../public/data/party-data.json';
import historyData from '../../public/data/history.json';
import constituencyData from '../../public/data/constituencies.json';

export type VoteShare = { party: string; share: number };
export type LeaderParty = { name: string; seats: number; momentum: number };

export type LiveAlliance = {
  name: string;
  won: number;
  leading: number;
  projected: number;
  range: string;
  color: string;
};

// All fields required so old components never see undefined
export type LiveData = {
  status: string;
  note: string;
  lastUpdated: string | null;
  lastChecked: string | null;
  totalSeats: number;
  majority: number;
  reported: number;
  alliances: LiveAlliance[];
  // Legacy fields populated from alliances for old components
  reportedSeats: number;
  leadingParties: LeaderParty[];
  voteShare: VoteShare[];
  turnout: number;
};

export type ConstituencyResult = {
  name: string;
  party: string;
  winner: string;
  margin: number;
  turnout: number;
  region: string;
  status: string;
};

export type PartyData = {
  slug: string;
  name: string;
  seats: number;
  voteShare: number;
  momentum: number;
  summary: string;
  description: string;
};

export type HistorySnapshot = {
  year: string;
  dmkSeats: number;
  aiadmkSeats: number;
  dmkShare: number;
  aiadmkShare: number;
};

export function getLiveData(): LiveData {
  const d = liveSummary;
  const sorted = [...d.alliances].sort((a, b) => (b.won + b.leading) - (a.won + a.leading));
  return {
    ...d,
    // Populate legacy fields from new format
    reportedSeats: d.reported,
    leadingParties: sorted.map((a) => ({
      name: a.name,
      seats: a.won + a.leading,
      momentum: 0,
    })),
    voteShare: sorted.map((a) => ({
      party: a.name,
      share: 0,
    })),
    turnout: 72,
  };
}

export function getPartyData(): PartyData[] {
  return partyData;
}

export function getHistoryData(): HistorySnapshot[] {
  return historyData;
}

export function getConstituencyData(): ConstituencyResult[] {
  return constituencyData;
}

export function getPartyPaths() {
  return partyData.map((party) => ({ params: { slug: party.slug } }));
}
