import { AxiosResponse } from 'axios';
import { Option } from '../../src/config/formInterfaces';
import { Artist } from '../../src/config/interfaces';
import { getArtistsSelectData, getSongsSelectData } from '../../src/utils/artists';

const createMockAxiosResponse = (data: Artist[] | null | undefined): AxiosResponse<Artist[]> => ({
  data: data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as any
  },
  request: {}
});

describe('getArtistsSelectData', () => {

  // Test Case 1: artistsDb is null or undefined
  test('should return an empty array if artistsDb is null', () => {
    // @ts-ignore - Intentionally passing null to test robustness
    expect(getArtistsSelectData(null)).toEqual([]);
  });

  test('should return an empty array if artistsDb is undefined', () => {
    // @ts-ignore - Intentionally passing undefined to test robustness
    expect(getArtistsSelectData(undefined)).toEqual([]);
  });

  // Test Case 2: artistsDb.data is null or undefined
  test('should return an empty array if artistsDb.data is null', () => {
    const mockResponse = createMockAxiosResponse(null);
    expect(getArtistsSelectData(mockResponse)).toEqual([]);
  });

  test('should return an empty array if artistsDb.data is undefined', () => {
    const mockResponse = createMockAxiosResponse(undefined);
    expect(getArtistsSelectData(mockResponse)).toEqual([]);
  });

  // Test Case 3: artistsDb.data is an empty array
  test('should return an empty array if artistsDb.data is an empty array', () => {
    const mockResponse = createMockAxiosResponse([]);
    expect(getArtistsSelectData(mockResponse)).toEqual([]);
  });

  // Test Case 4: artistsDb.data contains valid artist objects
  test('should correctly transform artist data into select options', () => {
    const mockArtists: Artist[] = [
      { name: 'Queen', songs: ['Bohemian Rhapsody'] },
      { name: 'Led Zeppelin', songs: ['Stairway to Heaven'] },
      { name: 'Metallica', songs: ['Enter Sandman'] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Queen', label: 'Queen' },
      { value: 'Led Zeppelin', label: 'Led Zeppelin' },
      { value: 'Metallica', label: 'Metallica' },
    ];

    expect(getArtistsSelectData(mockResponse)).toEqual(expectedOptions);
  });

  // Test Case 5: artistsDb.data contains artists with special characters or varying casing
  test('should handle artist names with special characters or varying casing correctly', () => {
    const mockArtists: Artist[] = [
      { name: 'Mötley Crüe', songs: [] },
      { name: 'A-Ha', songs: [] },
      { name: 'The Beatles', songs: [] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Mötley Crüe', label: 'Mötley Crüe' },
      { value: 'A-Ha', label: 'A-Ha' },
      { value: 'The Beatles', label: 'The Beatles' },
    ];

    expect(getArtistsSelectData(mockResponse)).toEqual(expectedOptions);
  });

  // Test Case 6: Ensure `songs` property (or other unused properties) doesn't cause issues
  test('should ignore other properties on artist objects not relevant to select data', () => {
    const mockArtists: Artist[] = [
      { name: 'Artist A', songs: ['Song1'], genre: 'Rock' },
      { name: 'Artist B', songs: ['Song2'], isActive: true },
    ] as Artist[]; // Cast to Artist[] to satisfy type if genre/isActive not in Artist
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Artist A', label: 'Artist A' },
      { value: 'Artist B', label: 'Artist B' },
    ];

    expect(getArtistsSelectData(mockResponse)).toEqual(expectedOptions);
  });
});

describe('getSongsSelectData', () => {

  // Test Case 1: artistsDb is null or undefined
  test('should return an empty array if artistsDb is null', () => {
    // @ts-ignore - Intentionally passing null to test robustness
    expect(getSongsSelectData(null)).toEqual([]);
  });

  test('should return an empty array if artistsDb is undefined', () => {
    // @ts-ignore - Intentionally passing undefined to test robustness
    expect(getSongsSelectData(undefined)).toEqual([]);
  });

  // Test Case 2: artistsDb.data is null or undefined
  test('should return an empty array if artistsDb.data is null', () => {
    const mockResponse = createMockAxiosResponse(null);
    expect(getSongsSelectData(mockResponse)).toEqual([]);
  });

  test('should return an empty array if artistsDb.data is undefined', () => {
    const mockResponse = createMockAxiosResponse(undefined);
    expect(getSongsSelectData(mockResponse)).toEqual([]);
  });

  // Test Case 3: artistsDb.data is an empty array
  test('should return an empty array if artistsDb.data is an empty array', () => {
    const mockResponse = createMockAxiosResponse([]);
    expect(getSongsSelectData(mockResponse)).toEqual([]);
  });

  // Test Case 4: artistsDb.data contains artists, but no songs
  test('should return an empty array if artists have no songs', () => {
    const mockArtists: Artist[] = [
      { name: 'Artist A', songs: [] },
      { name: 'Artist B', songs: [] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);
    expect(getSongsSelectData(mockResponse)).toEqual([]);
  });

  // Test Case 5: artistsDb.data contains one artist with multiple songs
  test('should correctly transform one artist with multiple songs into select options', () => {
    const mockArtists: Artist[] = [
      { name: 'Queen', songs: ['Bohemian Rhapsody', 'Somebody to Love'] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Bohemian Rhapsody', label: 'Bohemian Rhapsody', artist: 'Queen' },
      { value: 'Somebody to Love', label: 'Somebody to Love', artist: 'Queen' },
    ];

    expect(getSongsSelectData(mockResponse)).toEqual(expectedOptions);
  });

  // Test Case 6: artistsDb.data contains multiple artists, each with songs
  test('should correctly transform multiple artists with songs into a combined list of select options', () => {
    const mockArtists: Artist[] = [
      { name: 'Artist 1', songs: ['Song A', 'Song B'] },
      { name: 'Artist 2', songs: ['Song X'] },
      { name: 'Artist 3', songs: ['Song Y', 'Song Z'] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Song A', label: 'Song A', artist: 'Artist 1' },
      { value: 'Song B', label: 'Song B', artist: 'Artist 1' },
      { value: 'Song X', label: 'Song X', artist: 'Artist 2' },
      { value: 'Song Y', label: 'Song Y', artist: 'Artist 3' },
      { value: 'Song Z', label: 'Song Z', artist: 'Artist 3' },
    ];

    expect(getSongsSelectData(mockResponse)).toEqual(expectedOptions);
  });

  // Test Case 7: Songs with special characters or varying casing
  test('should preserve original song names including special characters and casing', () => {
    const mockArtists: Artist[] = [
      { name: 'Artist X', songs: ['Song Title (Remix)!', 'Another Great Song'] },
    ];
    const mockResponse = createMockAxiosResponse(mockArtists);

    const expectedOptions: Option[] = [
      { value: 'Song Title (Remix)!', label: 'Song Title (Remix)!', artist: 'Artist X' },
      { value: 'Another Great Song', label: 'Another Great Song', artist: 'Artist X' },
    ];

    expect(getSongsSelectData(mockResponse)).toEqual(expectedOptions);
  });
});
