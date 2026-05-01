import { useEffect, useState } from 'react';
import { getConstituencyData, getLiveData, type ConstituencyResult, type LiveData } from '../data/electionData';

export default function useLiveData() {
  const [live, setLive] = useState<LiveData>(getLiveData());
  const [constituencies, setConstituencies] = useState<ConstituencyResult[]>(getConstituencyData());

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const liveUrl = `${basePath}/data/live-summary.json`;
    const constituencyUrl = `${basePath}/data/constituencies.json`;

    const refresh = async () => {
      try {
        const liveResponse = await fetch(liveUrl);
        if (liveResponse.ok) {
          const liveJson = (await liveResponse.json()) as LiveData;
          setLive(liveJson);
        }
      } catch (error) {
        console.warn('Failed to refresh live summary:', error);
      }

      try {
        const constituencyResponse = await fetch(constituencyUrl);
        if (constituencyResponse.ok) {
          const constituencyJson = (await constituencyResponse.json()) as ConstituencyResult[];
          setConstituencies(constituencyJson);
        }
      } catch (error) {
        console.warn('Failed to refresh constituency data:', error);
      }
    };

    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return { live, constituencies };
}
