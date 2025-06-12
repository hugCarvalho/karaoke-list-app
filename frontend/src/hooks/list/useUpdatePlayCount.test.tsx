import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useUpdatePlayCount } from './useUpdatePlayCount'; // Adjust the import path as necessary
// Mock external dependencies
import { updatePlayCount } from '../../api/api';
import queryClient from '../../config/queryClient';
import { QUERIES } from '../../constants/queries'; // Assuming QUERIES is a simple object export
import useAppToast from '../useAppToast';

type UpdatePlayCountVariables = {
  songId: string;
  plays: number;
  artist: string;
  title: string;
};

jest.mock('../../api/api', () => ({
  updatePlayCount: jest.fn(),
}));

jest.mock('../../config/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
  },
}));

jest.mock('../useAppToast', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
  })),
}));

// Cast mocked imports for easier Jest mock usage
const mockUpdatePlayCount = updatePlayCount as jest.Mock;
const mockInvalidateQueries = (queryClient.invalidateQueries as jest.Mock);
const mockUseAppToast = useAppToast as jest.Mock;

describe('useUpdatePlayCount', () => {
  let reactQueryClient: QueryClient; // Use a distinct name to avoid conflict with the mocked queryClient

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
    mockUpdatePlayCount.mockClear();
    mockInvalidateQueries.mockClear();
    mockUseAppToast.mockClear();
    // Re-mock useAppToast for each test to ensure fresh spy functions
    mockUseAppToast.mockReturnValue({
      showSuccessToast: jest.fn(),
      showErrorToast: jest.fn(),
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={reactQueryClient} >
        {children}
      </QueryClientProvider>
    );
  };

  test('should call updatePlayCount, show success toast, and invalidate queries on success', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song123', artist: 'Artist A', title: 'Song Title 1', plays: 5 };
    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(undefined), 50)); // Simulate API delay
    });

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    // Wait for the mutation to settle to success state
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify updatePlayCount API was called with correct arguments
    expect(mockUpdatePlayCount).toHaveBeenCalledWith(variables);

    // Verify showSuccessToast was called
    const { showSuccessToast, showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showSuccessToast).toHaveBeenCalledWith("Song updated", "The song has been updated.");
    expect(showErrorToast).not.toHaveBeenCalled();

    // Verify queryClient.invalidateQueries was called
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
  });

  test('should call showErrorToast on error', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song456', artist: 'Artist B', title: 'Song Title 2', plays: 10 };
    const errorMessage = 'Network error during update';
    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), 50)); // Simulate API error
    });

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    // Wait for the mutation to settle to error state
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify updatePlayCount API was called
    expect(mockUpdatePlayCount).toHaveBeenCalledWith(variables);

    // Verify queryClient.invalidateQueries was NOT called on error
    expect(mockInvalidateQueries).not.toHaveBeenCalled();

    // Verify showErrorToast was called
    const { showSuccessToast, showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showErrorToast).toHaveBeenCalledWith(
      "Error updating song",
      errorMessage
    );
    expect(showSuccessToast).not.toHaveBeenCalled();
  });

  test('should call showErrorToast with generic message if error has no message', async () => {
    const variables: UpdatePlayCountVariables = { songId: 'song789', artist: 'Artist C', title: 'Song Title 3', plays: 1 };
    mockUpdatePlayCount.mockImplementation(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error()), 50)); // Simulate API error with no message
    });

    const { result } = renderHook(() => useUpdatePlayCount(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    // Wait for the error state
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);

    // Verify showErrorToast was called with the generic message
    const { showSuccessToast, showErrorToast } = mockUseAppToast.mock.results[0].value;
    expect(showErrorToast).toHaveBeenCalledWith(
      "Error updating song",
      "An error occurred while updating the song."
    );
    expect(showSuccessToast).not.toHaveBeenCalled();
  });
});
