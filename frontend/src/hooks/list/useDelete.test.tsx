import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeleteSong } from './useDeleteSong';
// Mock external dependencies
import { deleteSong } from '../../api/api';
import queryClient from '../../config/queryClient';
import { QUERIES } from '../../constants/queries';
import useAppToast from '../useAppToast';

jest.mock('../../api/api', () => ({
  deleteSong: jest.fn(),
}));

// Mock queryClient to spy on its methods
jest.mock('../../config/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
  },
}));

jest.mock('../useAppToast', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    showErrorToast: jest.fn(),
  })),
}));

const mockDeleteSong = deleteSong as jest.Mock;
const mockInvalidateQueries = (queryClient.invalidateQueries as jest.Mock);
const mockUseAppToast = useAppToast as jest.Mock;

describe('useDeleteSong', () => {
  let reactQueryClient: QueryClient;

  // Set up a new QueryClient for each test to ensure tests are isolated
  beforeEach(() => {
    reactQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for deterministic test results
        },
        mutations: {
          retry: false, // Disable retries for deterministic test results
        },
      },
    });
    // Clear mocks before each test
    mockDeleteSong.mockClear();
    mockInvalidateQueries.mockClear();
    mockUseAppToast.mockClear();
    // Re-mock showErrorToast for each test to ensure a fresh spy
    mockUseAppToast.mockReturnValue({ showErrorToast: jest.fn() });
  });


  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={reactQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  test('should call deleteSong and invalidate queries on success', async () => {
    const { result } = renderHook(() => useDeleteSong(), { wrapper: createWrapper() });

    const { mutate } = result.current;

    mutate({ songId: 'someSongId' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteSong).toHaveBeenCalledWith({ songId: 'someSongId' });

    // Verify queryClient.invalidateQueries was called with the correct key
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });

    // Verify showErrorToast was NOT called on success
    const { showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  test('should call showErrorToast on error', async () => {
    const errorMessage = 'Failed to delete song due to network error';
    mockDeleteSong.mockRejectedValue(new Error(errorMessage)); // Mock deletion failure

    const { result } = renderHook(() => useDeleteSong(), { wrapper: createWrapper() });

    const { mutate } = result.current;

    // Trigger the mutation
    mutate({ songId: 'someSongId3' });

    // Wait for the mutation to settle (to error state)
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify deleteSong API was called
    expect(mockDeleteSong).toHaveBeenCalledWith({ songId: 'someSongId3' });

    // Verify queryClient.invalidateQueries was NOT called on error
    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    // Verify showErrorToast was called with the correct message
    const { showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showErrorToast).toHaveBeenCalledWith(
      "Error deleting song",
      errorMessage
    );
  });

  test('should call showErrorToast with generic message if error has no message', async () => {
    mockDeleteSong.mockRejectedValue(new Error());

    const { result } = renderHook(() => useDeleteSong(), { wrapper: createWrapper() });

    const { mutate } = result.current;
    mutate({ songId: 'someSongId' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showErrorToast).toHaveBeenCalledWith(
      "Error deleting song",
      "An error occurred while deleting the song."
    );
  });
});
