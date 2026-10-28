import { useEffect, useRef, useState } from 'react';
import { api } from './api';

/** Runs an api call and re-runs it whenever the data layer changes. Returns undefined until the first result. */
export function useResource<T>(load: () => Promise<T>, deps: readonly unknown[] = []): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let live = true;
    const run = () => {
      loadRef.current().then((v) => {
        if (live) setValue(v);
      });
    };
    run();
    const off = api.subscribe(run);
    return () => {
      live = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are supplied by the caller
  }, deps);

  return value;
}
