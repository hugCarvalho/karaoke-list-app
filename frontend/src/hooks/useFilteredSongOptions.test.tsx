import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFilteredSongOptions } from './useFilteredSongOptions'; // Adjust the import path as necessary

// Mock external dependencies
import { Option } from '../config/formInterfaces'; // Ensure Option type is correctly imported
import { getSongsFromOpenAI } from '../services/externalApi';

jest.mock('../services/externalApi', () => ({
  getSongsFromOpenAI: jest.fn(),
}));

// Cast the mocked function for easier Jest mock usage
const mockGetSongsFromOpenAI = getSongsFromOpenAI as jest.Mock;

describe('useFilteredSongOptions', () => {
  let queryClient: QueryClient;

  // Set up a new QueryClient for each test to ensure tests are isolated
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable retries and garbage collection in tests for deterministic behavior
          retry: false,
          staleTime: Infinity, // Match hook's staleTime for predictable behavior
          gcTime: Infinity,    // Prevent garbage collection during test
        },
      },
    });
    mockGetSongsFromOpenAI.mockClear();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient} >
        {children}
      </QueryClientProvider>
    );
  };

  const MOCK_DB_SONGS: Option[] = [
    { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' },
    { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
    { value: 'Song C by Artist Two', label: 'Song C by Artist Two', artist: 'Artist Two' },
    { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
  ];

  // Test 1: Initial state when no artist is selected
  test('should return empty options and not call OpenAI API when no artist is selected', async () => {
    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: null }),
      { wrapper: createWrapper() }
    );

    // Expect the initial state: no options, not loading, and API not called
    expect(result.current.options).toEqual([]);
    expect(result.current.isLoadingOpenAI).toBe(false);
    expect(mockGetSongsFromOpenAI).not.toHaveBeenCalled();
  });

  // Test 2: Artist selected, API returns empty (no backend songs)
  test('should return only DB songs when artist is selected and backend API returns empty', async () => {
    const artist = { value: 'Artist One', label: 'Artist One' };
    mockGetSongsFromOpenAI.mockResolvedValue([]); // Mock OpenAI to return an empty array

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true initially as API call is triggered
    expect(result.current.isLoadingOpenAI).toBe(true);
    // options will initially be just filtered DB songs before backend data arrives
    expect(result.current.options).toEqual([
      { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' },
      { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
      { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
    ]);

    // Wait for the query to resolve and loading to become false
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify API call and final options (should still be only filtered DB songs)
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist One');
    expect(result.current.options).toEqual([
      { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' },
      { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
      { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
    ]);
  });

  // Test 3: Artist selected, backend songs fetched, no DB songs
  test('should return only backend songs if no DB songs are found for the artist', async () => {
    const artist = { value: 'Artist XYZ', label: 'Artist XYZ' }; // Artist not in MOCK_DB_SONGS
    const backendSongs: Option[] = [
      { value: 'Backend Song 1', label: 'Backend Song 1', artist: 'Artist XYZ' },
      { value: 'Backend Song 2', label: 'Backend Song 2', artist: 'Artist XYZ' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoadingOpenAI).toBe(true);
    expect(result.current.options).toEqual([]); // Initially empty as no DB songs for Artist XYZ

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist XYZ');
    expect(result.current.options).toEqual(backendSongs);
  });

  // Test 4: Combine DB and backend songs without duplicates
  test('should combine DB and backend songs without duplicates when no overlaps', async () => {
    const artist = { value: 'Artist One', label: 'Artist One' };
    const backendSongs: Option[] = [
      { value: 'New Backend Song X', label: 'New Backend Song X', artist: 'Artist One' },
      { value: 'New Backend Song Y', label: 'New Backend Song Y', artist: 'Artist One' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Initial state: only filtered DB songs
    expect(result.current.options).toEqual([
      { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' },
      { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
      { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
    ]);

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist One');

    // Expected combined and unique list
    expect(result.current.options).toEqual([
      { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' },
      { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
      { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
      { value: 'New Backend Song X', label: 'New Backend Song X', artist: 'Artist One' },
      { value: 'New Backend Song Y', label: 'New Backend Song Y', artist: 'Artist One' },
    ]);
  });

  // Test 5: Combine DB and backend songs with duplicates (DB takes priority)
  test('should return unique options, prioritizing DB songs over backend songs for duplicates', async () => {
    const artist = { value: 'Artist One', label: 'Artist One' };
    const backendSongs: Option[] = [
      { value: 'Song A by Artist One', label: 'Song A (Backend)', artist: 'Artist One' }, // Duplicate value, different label
      { value: 'Unique Backend Song', label: 'Unique Backend Song', artist: 'Artist One' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist One');

    // Expect unique options, with the DB version of 'Song A by Artist One' taking priority
    expect(result.current.options).toEqual([
      { value: 'Song A by Artist One', label: 'Song A by Artist One', artist: 'Artist One' }, // DB version
      { value: 'Song B by Artist One', label: 'Song B by Artist One', artist: 'Artist One' },
      { value: 'Song D by Artist One', label: 'Song D by Artist One', artist: 'Artist One' },
      { value: 'Unique Backend Song', label: 'Unique Backend Song', artist: 'Artist One' },
    ]);
  });

  // Test 6: Loading state transition
  test('should set isLoadingOpenAI to true during fetch and false after resolution', async () => {
    const artist = { value: 'Artist Loading', label: 'Artist Loading' };
    // Simulate a delayed response for the API call
    mockGetSongsFromOpenAI.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true immediately after hook renders (query enabled)
    expect(result.current.isLoadingOpenAI).toBe(true);

    // As useQuery manages its own async, waitFor is typically sufficient here
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false), { timeout: 300 });

    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist Loading');
  });

  // Test 7: Error during OpenAI fetch
  test('should handle error during OpenAI fetch gracefully and options remain from DB', async () => {
    const artist = { value: 'Artist Error', label: 'Artist Error' };
    // Mock an error rejection
    mockGetSongsFromOpenAI.mockRejectedValueOnce(new Error('OpenAI API Error'));

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true initially
    expect(result.current.isLoadingOpenAI).toBe(true);

    // Wait for the query to settle (to error state, isLoading becomes false)
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false), { timeout: 150 });

    // Verify API call was made
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist Error');

    // Options should contain only the filtered DB songs, as backend fetch failed
    expect(result.current.options).toEqual([
      // Assuming Artist Error has no direct match in MOCK_DB_SONGS, so it will be empty initially
      // If there were DB songs for 'Artist Error', they would appear here
    ]);
  });

  // Test 8: `useMemo` efficiency - no re-calculation if dependencies don't change
  test('should not re-calculate filtered options if dependencies are referentially stable on re-render', async () => {
    const artist = { value: 'Artist One', label: 'Artist One' };
    const backendSongs: Option[] = [
      { value: 'New Backend Song X', label: 'New Backend Song X', artist: 'Artist One' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result, rerender } = renderHook(
      ({ songOptions, artistOptionValue }) => useFilteredSongOptions({ songOptions, artistOptionValue }),
      {
        initialProps: { songOptions: MOCK_DB_SONGS, artistOptionValue: artist },
        wrapper: createWrapper(),
      }
    );

    // Wait for the initial API call to resolve
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // The useMemo for filteredAndUniqueOptions runs once after initial fetch resolves
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1); // API called once

    // Rerender the hook with the exact same (referentially stable) props
    // We use act() here to ensure any synchronous re-calculations triggered by rerender are completed
    act(() => {
      rerender({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist });
    });

    // Expect useMemo not to re-run because inputs (songOptions, artistOptionValue, backendSongOptions) are stable
    // mockGetSongsFromOpenAI should NOT be called again due to staleTime: Infinity
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1); // Still only 1 API call

    // Also, the memoized output of useMemo should not have changed if its dependencies didn't change.
    const initialOptions = result.current.options;

    act(() => {
      rerender({ songOptions: MOCK_DB_SONGS, artistOptionValue: artist });
    });

    expect(result.current.options).toBe(initialOptions); // Check referential equality of the array
  });

  // Test 9: `useMemo` recalculation when `songOptions` prop changes
  test('should re-calculate filtered options when songOptions prop changes', async () => {
    const artist = { value: 'Artist One', label: 'Artist One' };
    const backendSongs: Option[] = [
      { value: 'OpenAI Song 1', label: 'OpenAI Song 1', artist: 'Artist One' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const initialDbSongs: Option[] = [
      { value: 'DB Song X', label: 'DB Song X', artist: 'Artist One' },
    ];

    const { result, rerender } = renderHook(
      ({ songOptions, artistOptionValue }) => useFilteredSongOptions({ songOptions, artistOptionValue }),
      {
        initialProps: { songOptions: initialDbSongs, artistOptionValue: artist },
        wrapper: createWrapper(),
      }
    );

    // Wait for initial API fetch to resolve
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Initial combined options
    expect(result.current.options).toEqual([
      { value: 'DB Song X', label: 'DB Song X', artist: 'Artist One' },
      { value: 'OpenAI Song 1', label: 'OpenAI Song 1', artist: 'Artist One' },
    ]);

    // Update songOptions prop (create a new array reference)
    const updatedDbSongs: Option[] = [
      ...initialDbSongs,
      { value: 'DB Song Y', label: 'DB Song Y', artist: 'Artist One' }, // New song
    ];

    act(() => {
      rerender({ songOptions: updatedDbSongs, artistOptionValue: artist });
    });

    // API should NOT be called again as artistOptionValue and queryKey didn't change, and staleTime is Infinity
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);

    // `useMemo` should re-calculate, incorporating the new DB song
    expect(result.current.options).toEqual([
      { value: 'DB Song X', label: 'DB Song X', artist: 'Artist One' },
      { value: 'DB Song Y', label: 'DB Song Y', artist: 'Artist One' }, // New song
      { value: 'OpenAI Song 1', label: 'OpenAI Song 1', artist: 'Artist One' },
    ]);
  });
});
