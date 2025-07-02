import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useUpdatePlayCount } from './useUpdatePlayCount';
// Mock the `apiClient` module directly since it uses `import.meta.env`
jest.mock('../../config/apiClient', () => ({
  __esModule: true,
  default: {
    // Provide a mocked Axios instance or just the methods that `api.ts` uses
    patch: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import * as api from '../../api/api'; // Now this will get the mocked apiClient
import * as queryClientModule from '../../config/queryClient';
import { QUERIES } from '../../constants/queries';
import * as useAppToastHook from '../useAppToast';

// 1. Mock API function
const mockUpdatePlayCount = jest.spyOn(api, 'updatePlayCount');

// 2. Mock useAppToast hook
const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();
const mockShowInfoToast = jest.fn();
const mockShowWarningToast = jest.fn();
const mockedUseAppToast = jest.spyOn(useAppToastHook, 'default') as jest.Mock;

mockedUseAppToast.mockReturnValue({
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
  showInfoToast: mockShowInfoToast,
  showWarningToast: mockShowWarningToast,
});

// 3. Mock the global queryClient module used by hook
jest.mock('../../config/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    cancelQueries: jest.fn(),
    getQueryData: jest.fn(),
  },
}));

// Cast the default export of the mocked module for type safety and easier access
const mockedQueryClientInstance = queryClientModule.default as jest.Mocked<typeof queryClientModule.default>;

type UpdatePlayCountVariables = {
  songId: string;
  artist: string;
  title: string;
};

describe('useUpdatePlayCount', () => {
  let testQueryClientForProvider: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedQueryClientInstance.invalidateQueries.mockClear();
    mockedQueryClientInstance.setQueryData.mockClear();
    mockedQueryClientInstance.cancelQueries.mockClear();
    mockedQueryClientInstance.getQueryData.mockClear();

    mockShowSuccessToast.mockClear();
    mockShowErrorToast.mockClear();
    mockedUseAppToast.mockReturnValue({
      showSuccessToast: mockShowSuccessToast,
      showErrorToast: mockShowErrorToast,
    });

    testQueryClientForProvider = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
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

  test('should call updatePlayCount, show success toast, and invalidate queries on success', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song123', artist: 'Artist A', title: 'Song Title 1' };

    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(undefined), 50));
    });

    mockedQueryClientInstance.getQueryData.mockReturnValue([
      {
        songId: 'song123',
        plays: 0,
        events: [],
        title: 'Song Title 1',
        artist: 'Artist A',
        blacklisted: false, fav: false, inNextEventList: false, duet: false, notAvailable: false,
      }
    ]);

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 2000 });

    expect(mockUpdatePlayCount).toHaveBeenCalledWith(variables);

    expect(mockShowSuccessToast).toHaveBeenCalledWith("Play count updated", "The song's play count has been increased.");
    expect(mockShowErrorToast).not.toHaveBeenCalled();

    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledTimes(2);

    expect(mockedQueryClientInstance.cancelQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenCalledWith(
      [QUERIES.SONGS_LIST],
      expect.any(Function)
    );
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenCalledTimes(1);
    expect(mockedQueryClientInstance.getQueryData).toHaveBeenCalledWith([QUERIES.SONGS_LIST]);
  });

  test('should call showErrorToast on error and rollback optimistic update', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song456', artist: 'Artist B', title: 'Song Title 2' };
    const errorMessage = 'Network error during update';
    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), 50)); // Simulate API error
    });

    const mockInitialSongsList = [
      { songId: 'song456', plays: 10, events: [], title: 'Song Title 2', artist: 'Artist B', blacklisted: false, fav: false, inNextEventList: false, duet: false, notAvailable: false },
      { songId: 'otherSong', plays: 5, events: [], title: 'Other Song', artist: 'Other Artist', blacklisted: false, fav: false, inNextEventList: false, duet: false, notAvailable: false }
    ];
    mockedQueryClientInstance.getQueryData.mockReturnValue(mockInitialSongsList);

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    // Wait for the mutation to settle to error state
    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 2000 });
    expect(result.current.isPending).toBe(false);

    // Verify updatePlayCount API was called
    expect(mockUpdatePlayCount).toHaveBeenCalledWith(variables);

    // Verify showErrorToast was called
    expect(mockShowErrorToast).toHaveBeenCalledWith(
      "Error updating play count",
      errorMessage
    );
    expect(mockShowSuccessToast).not.toHaveBeenCalled();
    expect(mockShowInfoToast).not.toHaveBeenCalled();
    expect(mockShowWarningToast).not.toHaveBeenCalled();

    // Verify optimistic rollback was performed
    // setQueryData is called once for optimistic update and once for rollback
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenCalledWith(
      [QUERIES.SONGS_LIST],
      mockInitialSongsList // Expect rollback to the original list
    );
    // --- FIX IS HERE: EXPECTED CALLS SHOULD BE 2 ---
    expect(mockedQueryClientInstance.setQueryData).toHaveBeenCalledTimes(2); // One for optimistic, one for rollback

    // Verify queries were invalidated in onSettled (even on error)
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledTimes(2); // Invalidate happens onSettled
  });

  test('should call showErrorToast with generic message if error has no message', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song789', artist: 'Artist C', title: 'Song Title 3' };
    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error()), 50));
    });

    mockedQueryClientInstance.getQueryData.mockReturnValue([]);

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 2000 });
    expect(result.current.isPending).toBe(false);

    expect(mockShowErrorToast).toHaveBeenCalledWith(
      "Error updating play count",
      "An error occurred while increasing play count."
    );
    expect(mockShowSuccessToast).not.toHaveBeenCalled();

    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });
    expect(mockedQueryClientInstance.invalidateQueries).toHaveBeenCalledTimes(2);
  });
});
