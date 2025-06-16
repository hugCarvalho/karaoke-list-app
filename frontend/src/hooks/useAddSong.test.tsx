import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useAddSong } from './useAddSong';
// Mock external dependencies
import { addSangSong, addSong } from '../api/api';
import { Song } from '../config/interfaces';
import queryClient from '../config/queryClient';
import { QUERIES } from '../constants/queries';
import useAppToast from './useAppToast';

// Mock API functions
jest.mock('../api/api', () => ({
  addSong: jest.fn(),
  addSangSong: jest.fn(),
}));

// Mock queryClient
jest.mock('../config/queryClient', () => ({
  invalidateQueries: jest.fn(),
}));

// Mock useAppToast
jest.mock('./useAppToast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Create mock functions for the toast messages
const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();

const mockAddSong = addSong as jest.Mock;
const mockAddSangSong = addSangSong as jest.Mock;
const mockInvalidateQueries = queryClient.invalidateQueries as jest.Mock;
const mockUseAppToast = useAppToast as jest.Mock;

describe('useAddSong', () => {
  let reactQueryClient: QueryClient;

  // Setup for each test
  beforeEach(() => {
    reactQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Clear all mocks before each test to ensure a clean slate
    mockAddSong.mockClear();
    mockAddSangSong.mockClear();
    mockInvalidateQueries.mockClear();
    mockShowSuccessToast.mockClear();
    mockShowErrorToast.mockClear();

    // Configure useAppToast mock for each test
    mockUseAppToast.mockReturnValue({
      showSuccessToast: mockShowSuccessToast,
      showErrorToast: mockShowErrorToast,
    });
  });

  // Wrapper for renderHook to provide QueryClientProvider
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={reactQueryClient} >
        {children}
      </QueryClientProvider>
    );
  };

  const MOCK_SONG_DATA: Song = {
    songId: 'new-song-123',
    artist: 'Mock Artist',
    title: 'Mock Title',
    plays: 0,
    fav: false,
    blacklisted: false,
    inNextEventList: false,
    duet: false,
    notAvailable: false,
    events: []
  };

  // --- Tests for type="list" (addSong) ---

  test('should call addSong, show success toast, and invalidate queries on success when type is "list"', async () => {
    mockAddSong.mockResolvedValueOnce(undefined); // Mock successful response for addSong

    const { result } = renderHook(() => useAddSong('list'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      // Verify addSong was called
      expect(mockAddSong).toHaveBeenCalledTimes(1);
      expect(mockAddSong).toHaveBeenCalledWith(MOCK_SONG_DATA);
      expect(mockAddSangSong).not.toHaveBeenCalled(); // Ensure addSangSong was NOT called

      // Verify success toast
      expect(mockShowSuccessToast).toHaveBeenCalledTimes(1);
      expect(mockShowSuccessToast).toHaveBeenCalledWith("Song added.", "The song has been added to your list.");

      // Verify queries invalidated
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });

      // Verify mutation state
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  test('should call showErrorToast on addSong failure when type is "list"', async () => {
    const errorMessage = 'Failed to add song to list';
    mockAddSong.mockRejectedValueOnce(new Error(errorMessage)); // Mock failed response for addSong

    const { result } = renderHook(() => useAddSong('list'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      // Verify addSong was called
      expect(mockAddSong).toHaveBeenCalledTimes(1);
      expect(mockAddSong).toHaveBeenCalledWith(MOCK_SONG_DATA);
      expect(mockAddSangSong).not.toHaveBeenCalled(); // Ensure addSangSong was NOT called

      // Verify error toast
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Error adding song.", errorMessage);

      // Verify no success toast
      expect(mockShowSuccessToast).not.toHaveBeenCalled();

      // Verify queries NOT invalidated
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      // Verify mutation state
      expect(result.current.isError).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  test('should call showErrorToast with generic message on addSong failure (type "list")', async () => {
    mockAddSong.mockRejectedValueOnce(new Error()); // Mock generic error for addSong

    const { result } = renderHook(() => useAddSong('list'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Error adding song.",
        "An error occurred while adding the song."
      );
    });
  });

  // --- Tests for type="event" (addSangSong) ---

  test('should call addSangSong, show success toast, and invalidate queries on success when type is "event"', async () => {
    mockAddSangSong.mockResolvedValueOnce(undefined); // Mock successful response for addSangSong

    const { result } = renderHook(() => useAddSong('event'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      // Verify addSangSong was called
      expect(mockAddSangSong).toHaveBeenCalledTimes(1);
      expect(mockAddSangSong).toHaveBeenCalledWith(MOCK_SONG_DATA);
      expect(mockAddSong).not.toHaveBeenCalled(); // Ensure addSong was NOT called

      // Verify success toast
      expect(mockShowSuccessToast).toHaveBeenCalledTimes(1);
      expect(mockShowSuccessToast).toHaveBeenCalledWith("Song added.", "The song has been added to your list.");

      // Verify queries invalidated
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });

      // Verify mutation state
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  test('should call showErrorToast on addSangSong failure when type is "event"', async () => {
    const errorMessage = 'Failed to add sang song to event';
    mockAddSangSong.mockRejectedValueOnce(new Error(errorMessage)); // Mock failed response for addSangSong

    const { result } = renderHook(() => useAddSong('event'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      // Verify addSangSong was called
      expect(mockAddSangSong).toHaveBeenCalledTimes(1);
      expect(mockAddSangSong).toHaveBeenCalledWith(MOCK_SONG_DATA);
      expect(mockAddSong).not.toHaveBeenCalled(); // Ensure addSong was NOT called

      // Verify error toast
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Error adding song.", errorMessage);

      // Verify no success toast
      expect(mockShowSuccessToast).not.toHaveBeenCalled();

      // Verify queries NOT invalidated
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      // Verify mutation state
      expect(result.current.isError).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });

  test('should call showErrorToast with generic message on addSangSong failure (type "event")', async () => {
    mockAddSangSong.mockRejectedValueOnce(new Error()); // Mock generic error for addSangSong

    const { result } = renderHook(() => useAddSong('event'), { wrapper: createWrapper() });

    result.current.mutate(MOCK_SONG_DATA);

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Error adding song.",
        "An error occurred while adding the song."
      );
    });
  });

  test('should return idle state initially', () => {
    const { result } = renderHook(() => useAddSong('list'), { wrapper: createWrapper() });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockAddSong).not.toHaveBeenCalled();
    expect(mockAddSangSong).not.toHaveBeenCalled();
    expect(mockShowSuccessToast).not.toHaveBeenCalled();
    expect(mockShowErrorToast).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
