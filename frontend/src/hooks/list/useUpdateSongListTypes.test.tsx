import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import * as api from '../../api/api';
import * as queryClientModule from '../../config/queryClient';
import { QUERIES } from '../../constants/queries';
import { useUpdateSongListTypes } from './useUpdateSongListTypes';

jest.mock('../../config/apiClient', () => ({
  __esModule: true,
  default: {
    patch: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../api/api', () => ({
  updateSongListTypes: jest.fn(),
}));


jest.mock('../../config/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
    cancelQueries: jest.fn(),
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
  },
}));

const mockUpdateSongListTypes = api.updateSongListTypes as jest.Mock;
const mockedQueryClientInstance = queryClientModule.default as jest.Mocked<typeof queryClientModule.default>;

type CheckboxGroup = 'fav' | 'blacklisted' | 'inNextEventList' | 'duet' | 'notAvailable';

type UpdateSongListTypesVariables = {
  songId: string;
  value: boolean;
  type: CheckboxGroup;
};


describe('useUpdateSongListTypes', () => {
  let testQueryClientForProvider: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateSongListTypes.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: {},
      }), 50));
    });

    mockedQueryClientInstance.getQueryData.mockReturnValue(undefined);

    testQueryClientForProvider = new QueryClient({
      defaultOptions: {
        queries: { retry: false }, // Disable retries for deterministic test results.
        mutations: { retry: false }, // Disable retries for deterministic test results.
      },
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={testQueryClientForProvider}>
        {children}
      </QueryClientProvider>
    );
  };

  test('should return idle state initially', () => {
    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    expect(mockUpdateSongListTypes).not.toHaveBeenCalled();
    expect(mockedQueryClientInstance.invalidateQueries).not.toHaveBeenCalled();
    expect(mockedQueryClientInstance.cancelQueries).not.toHaveBeenCalled();
    expect(mockedQueryClientInstance.getQueryData).not.toHaveBeenCalled();
    expect(mockedQueryClientInstance.setQueryData).not.toHaveBeenCalled();
  });

  test('should perform optimistic update, call API, and invalidate queries on success', async () => {
    const variables: UpdateSongListTypesVariables = { songId: 'song123', value: true, type: 'fav' };

    const initialSongsInCache = [
      { songId: 'song123', fav: false, blacklisted: false, inNextEventList: false, duet: false, notAvailable: false, plays: 5, events: [] },
      { songId: 'song456', fav: true, blacklisted: false, inNextEventList: false, duet: false, notAvailable: false, plays: 10, events: [] },
    ];
    mockedQueryClientInstance.getQueryData.mockReturnValue(initialSongsInCache);

    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });
    const { mutate } = result.current; // Get the `mutate` function from the hook.

    mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });
    expect(result.current.isPending).toBe(false);
    expect(result.current.isIdle).toBe(false);

    expect(mockUpdateSongListTypes).toHaveBeenCalledTimes(1);
    expect(mockUpdateSongListTypes).toHaveBeenCalledWith(variables);

    // Verify that `invalidateQueries` was called (from `onSettled`).
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
  });

  test('should rollback optimistic update and invalidate queries on API error', async () => {
    const variables: UpdateSongListTypesVariables = { songId: 'song123', value: true, type: 'fav' };
    const apiErrorMessage = 'Network connection lost';

    mockUpdateSongListTypes.mockImplementationOnce(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error(apiErrorMessage)), 50));
    });

    const initialSongsInCache = [
      { songId: 'song123', fav: false, blacklisted: false, inNextEventList: false, duet: false, notAvailable: false, plays: 5, events: [] },
      { songId: 'song456', fav: true, blacklisted: false, inNextEventList: false, duet: false, notAvailable: false, plays: 10, events: [] },
    ];
    mockedQueryClientInstance.getQueryData.mockReturnValue(initialSongsInCache);

    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    // --- Wait for the mutation to settle to an error state ---
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 2000 });
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(apiErrorMessage);

    // --- Assertions for API Call and Rollback ---
    // Verify that the actual API function was called.
    expect(mockUpdateSongListTypes).toHaveBeenCalledTimes(1);
    expect(mockUpdateSongListTypes).toHaveBeenCalledWith(variables);

    // Verify that `setQueryData` was called a second time for the rollback.
    // The first call was for the optimistic update, the second for the rollback.
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenCalledTimes(2);
    // The second call should restore the previous (initial) data.
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenNthCalledWith(2, [QUERIES.SONGS_LIST], initialSongsInCache);

    // Verify that `invalidateQueries` was called (from `onSettled`), even on error.
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
  });
});
