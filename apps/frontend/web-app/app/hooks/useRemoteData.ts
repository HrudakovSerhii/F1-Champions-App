import { useCallback, useRef, useState } from 'react';
import DataFetcher from '../utils/dataFetcher/DataFetcher';

type FetchRemoteData = (
  fetchUrl: string,
  fetchQueryParams?: string
) => Promise<void>;

export interface RemoteData<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetchRemoteData: FetchRemoteData;
}

type Options = Omit<RequestInit, 'method'>;

function useRemoteData<T>(
  baseUrl: string,
  fetchOptions?: Options
): RemoteData<T> {
  const dataFetcher = useRef(new DataFetcher(baseUrl, fetchOptions));

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRemoteData: FetchRemoteData = useCallback(
    async (fetchUrl: string, fetchQueryParams?: string) => {
      setLoading(true);

      try {
        const result = await dataFetcher.current.fetch(
          fetchUrl,
          fetchQueryParams
        );

        setData(result as T);
        setError(null);
      } catch (error) {
        const castedError = error as unknown;

        setError(castedError as Error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    fetchRemoteData,
  };
}

export default useRemoteData;
