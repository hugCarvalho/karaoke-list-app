import { act, renderHook } from '@testing-library/react';
import { SortConfig } from 'src/config/formInterfaces';
import { ACTIONS } from '../../config/actions';
import { Song, } from '../../config/interfaces';
import { useSortableList } from './useSortableList';

jest.mock('../../config/actions', () => ({
  ACTIONS: {
    sortList: jest.fn((sortConfig: SortConfig, list: Song[]) => {
      // Simulate sorting by returning a *copy* of the list to avoid direct mutation issues
      // and allow a simple verification of inputs.
      const sorted = [...list].sort((a, b) => {
        if (!sortConfig || !sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
      return sorted;
    }),
  },
}));

// Cast the mocked function for easier Jest assertion syntax
const mockSortList = ACTIONS.sortList as jest.Mock;

describe('useSortableList', () => {
  const MOCK_SONGS: Song[] = [
    { songId: 's1', artist: 'Artist B', title: 'Song Z', plays: 5, fav: false, blacklisted: false, duet: false, inNextEventList: false, notAvailable: false, events: [] },
    { songId: 's2', artist: 'Artist A', title: 'Song Y', plays: 10, fav: false, blacklisted: false, duet: false, inNextEventList: false, notAvailable: false, events: [] },
    { songId: 's3', artist: 'Artist C', title: 'Song X', plays: 2, fav: false, blacklisted: false, duet: false, inNextEventList: false, notAvailable: false, events: [] },
  ];

  beforeEach(() => {
    mockSortList.mockClear();
    // Reset mock implementation for fresh state in each test
    mockSortList.mockImplementation((sortConfig: SortConfig, list: Song[]) => {
      const sorted = [...list].sort((a, b) => {
        if (!sortConfig || !sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  });

  // Test 1: Initial state and default sorting
  test('should initialize with default sort config and return sorted list', () => {
    const { result } = renderHook(() => useSortableList(MOCK_SONGS));

    // Check initial sortConfig
    expect(result.current.sortConfig).toEqual({ key: 'artist', direction: 'ascending' });

    // Verify sortList was called initially with the default config
    expect(mockSortList).toHaveBeenCalledTimes(1);
    expect(mockSortList).toHaveBeenCalledWith({ key: 'artist', direction: 'ascending' }, MOCK_SONGS);

    // Verify the list is returned sorted by the mock implementation
    expect(result.current.sortedList[0].artist).toBe('Artist A');
    expect(result.current.sortedList[1].artist).toBe('Artist B');
    expect(result.current.sortedList[2].artist).toBe('Artist C');
  });

  // Test 2: Initial sort key can be overridden
  test('should initialize with provided initialSortKey', () => {
    const { result } = renderHook(() => useSortableList(MOCK_SONGS, 'title'));

    expect(result.current.sortConfig).toEqual({ key: 'title', direction: 'ascending' });
    expect(mockSortList).toHaveBeenCalledTimes(1);
    expect(mockSortList).toHaveBeenCalledWith({ key: 'title', direction: 'ascending' }, MOCK_SONGS);

    // Verify initial sort by title
    expect(result.current.sortedList[0].title).toBe('Song X');
    expect(result.current.sortedList[1].title).toBe('Song Y');
    expect(result.current.sortedList[2].title).toBe('Song Z');
  });

  // Test 3: `requestSort` changes key and defaults direction to ascending
  test('requestSort should change key and set direction to ascending if new key', () => {
    const { result } = renderHook(() => useSortableList(MOCK_SONGS, 'artist'));

    // Request sort by 'title'
    act(() => {
      result.current.requestSort('title');
    });

    // Verify sortConfig updated
    expect(result.current.sortConfig).toEqual({ key: 'title', direction: 'ascending' });

    // Verify sortList was called again with the new config
    expect(mockSortList).toHaveBeenCalledTimes(2); // Initial call + new request
    expect(mockSortList).toHaveBeenLastCalledWith({ key: 'title', direction: 'ascending' }, MOCK_SONGS);

    // Verify sorted list reflects new sort (by title)
    expect(result.current.sortedList[0].title).toBe('Song X');
    expect(result.current.sortedList[1].title).toBe('Song Y');
    expect(result.current.sortedList[2].title).toBe('Song Z');
  });

  // Test 4: `requestSort` toggles direction for the same key
  test('requestSort should toggle direction for the same key', () => {
    const { result } = renderHook(() => useSortableList(MOCK_SONGS, 'artist')); // Initially 'artist', ascending

    // First call: toggle to descending for 'artist'
    act(() => {
      result.current.requestSort('artist');
    });
    expect(result.current.sortConfig).toEqual({ key: 'artist', direction: 'descending' });
    expect(mockSortList).toHaveBeenCalledTimes(2);
    expect(mockSortList).toHaveBeenLastCalledWith({ key: 'artist', direction: 'descending' }, MOCK_SONGS);

    // Verify sorted list reflects new sort (artist descending)
    expect(result.current.sortedList[0].artist).toBe('Artist C');
    expect(result.current.sortedList[1].artist).toBe('Artist B');
    expect(result.current.sortedList[2].artist).toBe('Artist A');


    // Second call: toggle back to ascending for 'artist'
    act(() => {
      result.current.requestSort('artist');
    });
    expect(result.current.sortConfig).toEqual({ key: 'artist', direction: 'ascending' });
    expect(mockSortList).toHaveBeenCalledTimes(3);
    expect(mockSortList).toHaveBeenLastCalledWith({ key: 'artist', direction: 'ascending' }, MOCK_SONGS);

    // Verify sorted list reflects new sort (artist ascending again)
    expect(result.current.sortedList[0].artist).toBe('Artist A');
    expect(result.current.sortedList[1].artist).toBe('Artist B');
    expect(result.current.sortedList[2].artist).toBe('Artist C');
  });

  // Test 5: `sortedList` updates when `initialData` prop changes
  test('sortedList should re-sort when initialData prop changes', () => {
    const { result, rerender } = renderHook(
      ({ data, key }) => useSortableList(data, key as SortConfig["key"]),
      {
        initialProps: { data: MOCK_SONGS, key: 'artist' },
      }
    );

    // Verify initial sort
    expect(result.current.sortedList[0].artist).toBe('Artist A');

    const NEW_SONGS: Song[] = [
      { songId: 's4', artist: 'Artist D', title: 'Song V', plays: 1, fav: false, blacklisted: false, duet: false, inNextEventList: false, notAvailable: false, events: [] },
      ...MOCK_SONGS,
    ];

    act(() => {
      rerender({ data: NEW_SONGS, key: 'artist' });
    });

    // Verify sortList was called again due to initialData change
    expect(mockSortList).toHaveBeenCalledTimes(2);
    expect(mockSortList).toHaveBeenLastCalledWith({ key: 'artist', direction: 'ascending' }, NEW_SONGS);

    // Verify the list is re-sorted with new data
    expect(result.current.sortedList[0].artist).toBe('Artist A'); // Still A
    expect(result.current.sortedList[1].artist).toBe('Artist B'); // Still B
    expect(result.current.sortedList[2].artist).toBe('Artist C'); // Still C
    expect(result.current.sortedList[3].artist).toBe('Artist D'); // New D
  });

  test('should not re-sort if dependencies (initialData, sortConfig) do not change on re-render', () => {
    const { rerender } = renderHook(
      ({ data, key }) => useSortableList(data, key as SortConfig["key"]),
      {
        initialProps: { data: MOCK_SONGS, key: 'artist' },
      }
    );

    // Initial render causes one call to mockSortList
    expect(mockSortList).toHaveBeenCalledTimes(1);
    expect(mockSortList).toHaveBeenCalledWith({ key: 'artist', direction: 'ascending' }, MOCK_SONGS);

    // Rerender the hook without changing initialProps (i.e., data and key are referentially same)
    act(() => {
      rerender({ data: MOCK_SONGS, key: 'artist' });
    });

    // Expect no new call to mockSortList because useMemo should prevent it
    expect(mockSortList).toHaveBeenCalledTimes(1);
  });
});
