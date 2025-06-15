import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { updateSongListTypes } from '../../api/api';
import queryClient from '../../config/queryClient';
import { QUERIES } from '../../constants/queries';
import { useUpdateSongListTypes } from './useUpdateSongListTypes';

type CheckboxGroup = 'fav' | 'blacklisted' | 'inNextEventList' | 'duet' | 'notAvailable';

type UpdateSongListTypesVariables = {
  songId: string;
  value: boolean;
  type: CheckboxGroup;
};

jest.mock('../../api/api', () => ({
  updateSongListTypes: jest.fn(),
}));

jest.mock('../../config/queryClient', () => ({
  __esModule: true,
  default: {
    invalidateQueries: jest.fn(),
  },
}));

const mockUpdateSongListTypes = updateSongListTypes as jest.Mock;
const mockInvalidateQueries = (queryClient.invalidateQueries as jest.Mock);

describe('useUpdateSongListTypes', () => {
  let reactQueryClient: QueryClient;

  beforeEach(() => {
    reactQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockUpdateSongListTypes.mockClear();
    mockInvalidateQueries.mockClear();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={reactQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  test('should call updateSongListTypes and invalidate queries on success', async () => {
    const variables: UpdateSongListTypesVariables = { songId: 'song123', value: true, type: 'fav' };
    mockUpdateSongListTypes.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(undefined), 50));
    });

    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);

    expect(mockUpdateSongListTypes).toHaveBeenCalledWith(variables);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: [QUERIES.SONGS_LIST] });
  });

  test('should set mutation to error state on API failure', async () => {
    const variables: UpdateSongListTypesVariables = { songId: 'song456', value: false, type: 'blacklisted' };
    const errorMessage = 'Failed to update song types';
    mockUpdateSongListTypes.mockImplementation(() => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), 50));
    });

    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });
    const { mutate } = result.current;

    mutate(variables);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isPending).toBe(false);

    expect(mockUpdateSongListTypes).toHaveBeenCalledWith(variables);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  test('should return idle state initially', () => {
    const { result } = renderHook(() => useUpdateSongListTypes(), { wrapper: createWrapper() });

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(mockUpdateSongListTypes).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
