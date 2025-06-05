
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getSongsFromOpenAI } from 'src/services/externalApi';
import { Option } from '../../config/formInterfaces';
import { useFilteredSongOptions } from '../useFilteredSongOptions';

jest.mock('../../services/externalApi', () => ({
  getSongsFromOpenAI: jest.fn(),
}));

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
          staleTime: 0, // Data is immediately stale, forcing refetch on re-render if queryKey changes
          gcTime: 0,    // Cache entries are garbage collected instantly
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

  test('should return empty options and not call OpenAI API when no artist is selected', () => {
    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: null }),
      { wrapper: createWrapper() }
    );

    // Expect the initial state: no options, not loading, and API not called
    expect(result.current.options).toEqual([]);
    expect(result.current.isLoadingOpenAI).toBe(false);
    expect(mockGetSongsFromOpenAI).not.toHaveBeenCalled();
  });

  test('should return empty options when artist is selected but no songs from DB or backend', async () => {
    const artist = { value: 'Artist A', label: 'Artist A' };
    mockGetSongsFromOpenAI.mockResolvedValue([]);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true initially
    expect(result.current.isLoadingOpenAI).toBe(true);
    expect(result.current.options).toEqual([]);

    // Wait for the query to resolve and loading to become false
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify API call and final options
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist A');
    expect(result.current.options).toEqual([]);
  });

  test('should return only DB songs if no backend songs are found for the artist', async () => {
    const artist = { value: 'Artist B', label: 'Artist B' };
    const dbSongs: Option[] = [
      { value: 'DB Song 1', label: 'DB Song 1', artist: 'Artist B' },
      { value: 'DB Song 2', label: 'DB Song 2', artist: 'Artist B' },
      { value: 'Other Artist Song', label: 'Other Artist Song', artist: 'Artist X' }, // Not for Artist B
    ];
    mockGetSongsFromOpenAI.mockResolvedValue([]); // Mock OpenAI to return an empty array

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: dbSongs, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Wait for the query to resolve
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify API call and filtered options from DB
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist B');
    expect(result.current.options).toEqual([
      { value: 'DB Song 1', label: 'DB Song 1', artist: 'Artist B' },
      { value: 'DB Song 2', label: 'DB Song 2', artist: 'Artist B' },
    ]);
  });

  test('should return only backend songs if no DB songs are found for the artist', async () => {
    const artist = { value: 'Artist C', label: 'Artist C' };
    const backendSongs: Option[] = [
      { value: 'Backend Song X', label: 'Backend Song X', artist: 'Artist C' },
      { value: 'Backend Song Y', label: 'Backend Song Y', artist: 'Artist C' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify API call and backend options
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist C');
    expect(result.current.options).toEqual(backendSongs);
  });

  test('should combine DB and backend songs without duplicates when no overlaps', async () => {
    const artist = { value: 'Artist D', label: 'Artist D' };
    const dbSongs: Option[] = [
      { value: 'DB Song 1', label: 'DB Song 1', artist: 'Artist D' },
    ];
    const backendSongs: Option[] = [
      { value: 'Backend Song X', label: 'Backend Song X', artist: 'Artist D' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: dbSongs, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify combination. Order of combination in `useMemo` matters for deduplication.
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist D');
    expect(result.current.options).toEqual([...dbSongs, ...backendSongs]);
  });

  test('should return unique options, prioritizing DB songs over backend songs for duplicates', async () => {
    const artist = { value: 'Artist E', label: 'Artist E' };
    const dbSongs: Option[] = [
      { value: 'Common Song', label: 'Common Song (DB)', artist: 'Artist E' },
      { value: 'DB Only Song', label: 'DB Only Song', artist: 'Artist E' },
    ];
    const backendSongs: Option[] = [
      { value: 'Common Song', label: 'Common Song (Backend)', artist: 'Artist E' }, // Duplicate
      { value: 'Backend Only Song', label: 'Backend Only Song', artist: 'Artist E' },
    ];
    mockGetSongsFromOpenAI.mockResolvedValue(backendSongs);

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: dbSongs, artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    // Verify unique options, DB version of 'Common Song' should be kept
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist E');
    expect(result.current.options).toEqual([
      { value: 'Common Song', label: 'Common Song (DB)', artist: 'Artist E' },
      { value: 'DB Only Song', label: 'DB Only Song', artist: 'Artist E' },
      { value: 'Backend Only Song', label: 'Backend Only Song', artist: 'Artist E' },
    ]);
  });

  test('should set isLoadingOpenAI to true during fetch and false after resolution', async () => {
    const artist = { value: 'Artist F', label: 'Artist F' };
    // Simulate a delayed response
    mockGetSongsFromOpenAI.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true immediately
    expect(result.current.isLoadingOpenAI).toBe(true);

    // Wait for the query to resolve and loading to become false
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));

    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist F');
  });

  test('should handle error during OpenAI fetch gracefully', async () => {
    const artist = { value: 'Artist G', label: 'Artist G' };
    // Mock an error rejection
    mockGetSongsFromOpenAI.mockRejectedValueOnce(new Error('OpenAI API Error'));

    const { result } = renderHook(
      () => useFilteredSongOptions({ songOptions: [], artistOptionValue: artist }),
      { wrapper: createWrapper() }
    );

    // Expect loading to be true initially
    expect(result.current.isLoadingOpenAI).toBe(true);

    // Wait for the query to finish (it will likely fail silently or through retries if not configured)
    // For testing, we specifically wait for isLoading to turn false to confirm the query has settled
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false), { timeout: 2000 });

    // Verify API call was made, and options remain empty
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledWith('Artist G');
    expect(result.current.options).toEqual([]); // Options should still be based on what was available (empty in this case)
  });

  test('should re-calculate options when songOptions prop changes', async () => {
    const artist = { value: 'Artist H', label: 'Artist H' };
    mockGetSongsFromOpenAI.mockResolvedValueOnce([
      { value: 'Backend Song Z', label: 'Backend Song Z', artist: 'Artist H' },
    ]);

    const initialSongOptions: Option[] = [{ value: 'Song 1', label: 'Song 1', artist: 'Artist H' }];

    const { result, rerender } = renderHook(
      ({ songOptions: currentSongOptions, artistOptionValue: currentArtistOption }) =>
        useFilteredSongOptions({ songOptions: currentSongOptions, artistOptionValue: currentArtistOption }),
      {
        initialProps: { songOptions: initialSongOptions, artistOptionValue: artist },
        wrapper: createWrapper(),
      }
    );

    // Wait for the initial OpenAI fetch to resolve
    await waitFor(() => expect(result.current.isLoadingOpenAI).toBe(false));
    expect(result.current.options).toEqual([
      { value: 'Song 1', label: 'Song 1', artist: 'Artist H' },
      { value: 'Backend Song Z', label: 'Backend Song Z', artist: 'Artist H' },
    ]);

    // Update songOptions prop
    const updatedSongOptions: Option[] = [
      ...initialSongOptions,
      { value: 'New DB Song 2', label: 'New DB Song 2', artist: 'Artist H' }, // Added a new DB song
    ];

    rerender({ songOptions: updatedSongOptions, artistOptionValue: artist });

    // The useMemo should re-calculate immediately because songOptions changed
    expect(result.current.options).toEqual([
      { value: 'Song 1', label: 'Song 1', artist: 'Artist H' },
      { value: 'New DB Song 2', label: 'New DB Song 2', artist: 'Artist H' },
      { value: 'Backend Song Z', label: 'Backend Song Z', artist: 'Artist H' },
    ]);
    // OpenAI API should not be called again if artistOptionValue did not change
    expect(mockGetSongsFromOpenAI).toHaveBeenCalledTimes(1);
  });
});
