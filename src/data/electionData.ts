import liveSummary from '../../public/data/live-summary.json';
import partyData from '../../public/data/party-data.json';
import historyData from '../../public/data/history.json';
import constituencyData from '../../public/data/constituencies.json';

export type VoteShare = {
  party: string;
  share: number;
};

export type LeaderParty = {
  name: string;
  seats: number;
  momentum: number;
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

export type LiveData = {
  totalSeats: number;
  reportedSeats: number;
  leadingParties: LeaderParty[];
  voteShare: VoteShare[];
  turnout?: number;
  lastUpdated?: string;
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
  return liveSummary;
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
