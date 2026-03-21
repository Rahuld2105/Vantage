import { useState, useEffect } from 'react';
import { LIVE_FEED } from '../data/constants';

export function useLiveFeed(interval = 3500) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % LIVE_FEED.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { message: LIVE_FEED[index], index };
}
