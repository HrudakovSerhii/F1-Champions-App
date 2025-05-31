import { act, renderHook, waitFor } from '@testing-library/react';

import useRemoteData from '../useRemoteData';

import DataFetcher from '../../utils/dataFetcher/DataFetcher';

jest.mock('../../utils/dataFetcher/DataFetcher');

describe('useRemoteData hook', () => {
  const baseUrl = '/base-url';
  const testUrl = '/test';
  let fetchSpy: jest.SpyInstance;

  beforeAll(() => {
    fetchSpy = jest.spyOn(DataFetcher.prototype, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockReset();
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should set hook states correctly after successful data fetch', async () => {
    const testData = { data: 'testData' };
    const testQueryParams = 'param=value';

    fetchSpy.mockResolvedValueOnce(testData);

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

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(testUrl, testQueryParams);
  });

  it('should set hook states correctly after failed data fetch', async () => {
    const testError = new Error('test error');

    fetchSpy.mockRejectedValueOnce(testError);

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

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // fetchSpy mock DataFetcher.fetch(url: string, queryParams?: string). This is why second param expected to be undefined
    expect(fetchSpy).toHaveBeenCalledWith(testUrl, undefined);
  });
});
