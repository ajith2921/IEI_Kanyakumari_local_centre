import { useCallback, useEffect, useRef, useState } from "react";
import { parseApiError } from "../services/api";

export default function useFetchList(fetchFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasLoadedDataRef = useRef(false);
  const fetchFnRef = useRef(fetchFn);

  // Update ref without triggering re-fetch if function reference changes
  // This prevents unnecessary re-fetches when parent re-renders
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchFnRef.current();
      const nextData = response.data || [];
      setData(nextData);
      if (Array.isArray(nextData) ? nextData.length > 0 : Boolean(nextData)) {
        hasLoadedDataRef.current = true;
      }
    } catch (err) {
      // Keep already-rendered data visible when a transient retry/timeout happens.
      if (hasLoadedDataRef.current) {
        setError("");
      } else {
        setError(parseApiError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch once on mount + when deps change
  useEffect(() => {
    load();
  }, deps.length > 0 ? deps : []);

  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}
