import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useCloseEvent } from './useCloseEvent'; // Adjust the import path as necessary

// Mock external dependencies
import { closeEvent } from '../api/api';
import queryClient from '../config/queryClient';
import { QUERIES } from '../constants/queries';
import useAppToast from './useAppToast';

jest.mock('../api/api', () => ({
  closeEvent: jest.fn(),
}));

jest.mock('../config/queryClient', () => ({
  invalidateQueries: jest.fn(),
}));

jest.mock('./useAppToast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Create mock functions for the toast messages
const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();

const mockCloseEvent = closeEvent as jest.Mock;
const mockInvalidateQueries = queryClient.invalidateQueries as jest.Mock;
const mockUseAppToast = useAppToast as jest.Mock;

describe('useCloseEvent', () => {
  let reactQueryClient: QueryClient;

  beforeEach(() => {
    reactQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Clear all mocks before each test
    mockCloseEvent.mockClear();
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

  test('should call closeEvent, show success toast, and invalidate queries on success', async () => {
    // Mock a successful API response
    mockCloseEvent.mockResolvedValueOnce(undefined); // Or any successful response value

    const { result } = renderHook(() => useCloseEvent(), { wrapper: createWrapper() });

    // Trigger the mutation (no arguments expected by closeEvent)
    result.current.mutate();

    // Use waitFor to await the asynchronous side effects and state updates
    await waitFor(() => {
      // Expect the API function to have been called
      expect(mockCloseEvent).toHaveBeenCalledTimes(1);
      expect(mockCloseEvent).toHaveBeenCalledWith(); // Expect no arguments

      // Expect success toast to be shown
      expect(mockShowSuccessToast).toHaveBeenCalledTimes(1);
      expect(mockShowSuccessToast).toHaveBeenCalledWith("Event Closed.", "The event has been successfully closed.");

      // Expect queries to be invalidated
      expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.GET_EVENTS_LIST] });

      // Ensure no error toast was shown
      expect(mockShowErrorToast).not.toHaveBeenCalled();

      // Verify mutation state
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isIdle).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  test('should call showErrorToast on API failure', async () => {
    const errorMessage = 'Failed to connect to server';
    // Mock a failed API response
    mockCloseEvent.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useCloseEvent(), { wrapper: createWrapper() });

    // Trigger the mutation
    result.current.mutate();

    // Use waitFor to await the asynchronous side effects and state updates
    await waitFor(() => {
      // Expect the API function to have been called
      expect(mockCloseEvent).toHaveBeenCalledTimes(1);
      expect(mockCloseEvent).toHaveBeenCalledWith();

      // Expect error toast to be shown with specific message
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Error closing event.", errorMessage);

      // Ensure no success toast was shown
      expect(mockShowSuccessToast).not.toHaveBeenCalled();

      // Expect queries NOT to be invalidated on error
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      // Verify mutation state
      expect(result.current.isError).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isIdle).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });

  test('should call showErrorToast with generic message if error has no specific message', async () => {
    // Mock a failed API response with a generic error object
    mockCloseEvent.mockRejectedValueOnce(new Error());

    const { result } = renderHook(() => useCloseEvent(), { wrapper: createWrapper() });

    // Trigger the mutation
    result.current.mutate();

    // Use waitFor to await the asynchronous side effects and state updates
    await waitFor(() => {
      // Expect the API function to have been called
      expect(mockCloseEvent).toHaveBeenCalledTimes(1);
      expect(mockCloseEvent).toHaveBeenCalledWith();

      // Expect error toast to be shown with generic message
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Error closing event.",
        "An unexpected error occurred while closing the event."
      );

      // Ensure no success toast was shown
      expect(mockShowSuccessToast).not.toHaveBeenCalled();

      // Expect queries NOT to be invalidated on error
      expect(mockInvalidateQueries).not.toHaveBeenCalled();

      // Verify mutation state
      expect(result.current.isError).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isIdle).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });
  });

  test('should return idle state initially', () => {
    const { result } = renderHook(() => useCloseEvent(), { wrapper: createWrapper() });

    // Verify initial mutation state
    expect(result.current.isIdle).toBe(true);

    // Verify no API calls or toasts were made yet
    expect(mockCloseEvent).not.toHaveBeenCalled();
    expect(mockShowSuccessToast).not.toHaveBeenCalled();
    expect(mockShowErrorToast).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
