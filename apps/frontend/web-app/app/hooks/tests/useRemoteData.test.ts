import { act, renderHook, waitFor } from '@testing-library/react';
import {
  afterEach,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import useRemoteData from '../useRemoteData';

// Create a mock fetch function that we can control
const mockFetch = vi.fn();

// Mock the DataFetcher class
vi.mock('../../utils/dataFetcher/DataFetcher', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      fetch: mockFetch,
    })),
  };
});

describe('useRemoteData hook', () => {
  const baseUrl = '/base-url';
  const testUrl = '/test';

  afterEach(() => {
    mockFetch.mockReset();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set hook states correctly after successful data fetch', async () => {
    const testData = { data: 'testData' };
    const testQueryParams = 'param=value';

    mockFetch.mockResolvedValueOnce(testData);

    const { result } = renderHook(() =>
      useRemoteData<typeof testData>(baseUrl)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.fetchRemoteData(testUrl, testQueryParams);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBeNull();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(testUrl, testQueryParams);
  });

  it('should set hook states correctly after failed data fetch', async () => {
    const testError = new Error('test error');

    mockFetch.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useRemoteData(baseUrl));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.fetchRemoteData(testUrl);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(testError);

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // mockFetch mock DataFetcher.fetch(url: string, queryParams?: string). This is why second param expected to be undefined
    expect(mockFetch).toHaveBeenCalledWith(testUrl, undefined);
  });
});
