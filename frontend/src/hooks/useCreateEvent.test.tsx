import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createEvent } from '../api/api';
import queryClient from '../config/queryClient';
import { QUERIES } from '../constants/queries';
import useAppToast from './useAppToast';
import { useCreateEvent } from './useCreateEvent';

jest.mock('../api/api', () => ({
  createEvent: jest.fn(),
}));

jest.mock('./useAppToast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../config/queryClient', () => ({
  invalidateQueries: jest.fn(),
}));

const mockShowSuccessToast = jest.fn();
const mockShowErrorToast = jest.fn();

describe('useCreateEvent', () => {
  beforeEach(() => {
    (useAppToast as jest.Mock).mockReturnValue({
      showSuccessToast: mockShowSuccessToast,
      showErrorToast: mockShowErrorToast,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  );

  it('calls createEvent and handles success', async () => {
    (createEvent as jest.Mock).mockResolvedValueOnce({ data: 'mock-event' });

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalled();
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Event Created.',
        'The event has been added to your list.'
      );
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: [QUERIES.GET_EVENTS_LIST],
      });
    });
  });

  it('handles error correctly', async () => {
    const error = new Error('Create failed');
    (createEvent as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalled();
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Error creating event.',
        'Create failed'
      );
    });
  });

  it('handles unexpected error message', async () => {
    (createEvent as jest.Mock).mockRejectedValueOnce({});

    const { result } = renderHook(() => useCreateEvent(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        'Error creating event.',
        'An unexpected error occurred while creating the event.'
      );
    });
  });
});
