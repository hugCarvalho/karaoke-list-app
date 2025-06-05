import { capitalizeArtistNames, capitalizeSongNames } from '../../src/utils/strings.ts';

describe('capitalizeArtistName', () => {
  it('should capitalize the first letter of each word', () => {
    expect(capitalizeArtistNames('talking heads')).toBe('Talking Heads');
    expect(capitalizeArtistNames('the beatles')).toBe('The Beatles');
    expect(capitalizeArtistNames('a quick brown fox')).toBe('A Quick Brown Fox');
  });

  it('should handle extra spaces correctly', () => {
    expect(capitalizeArtistNames('  Pink  Floyd  ')).toBe('Pink Floyd');
    expect(capitalizeArtistNames('  the   who  ')).toBe('The Who');
  });

  it('should handle empty strings', () => {
    expect(capitalizeArtistNames('')).toBe('');
  });

  it('should handle single-word input', () => {
    expect(capitalizeArtistNames('Elvis')).toBe('Elvis');
  });

  it('should handle already capitalized input', () => {
    expect(capitalizeArtistNames('Talking Heads')).toBe('Talking Heads');
  });
});

describe('capitalizeSongNames', () => {
  // Test Case 1: Empty string
  test('should return an empty string for an empty input', () => {
    expect(capitalizeSongNames('')).toBe('');
  });

  // Test Case 2: Null or undefined input
  test('should return an empty string for null or undefined input', () => {
    // @ts-ignore - Intentionally testing null/undefined input for robustness
    expect(capitalizeSongNames(null)).toBe('');
    // @ts-ignore
    expect(capitalizeSongNames(undefined)).toBe('');
  });

  // Test Case 3: Single word
  test('should capitalize the first letter of a single word', () => {
    expect(capitalizeSongNames('hello')).toBe('Hello');
    expect(capitalizeSongNames('WORLD')).toBe('World');
    expect(capitalizeSongNames('tEsT')).toBe('Test');
  });

  // Test Case 4: Multiple words - standard capitalization
  test('should capitalize the first letter of each significant word', () => {
    expect(capitalizeSongNames('this is a test')).toBe('This is a Test');
    expect(capitalizeSongNames('another great song')).toBe('Another Great Song');
  });

  // Test Case 5: Small words in the middle (should be lowercase)
  test('should convert common small words to lowercase in the middle of a title', () => {
    expect(capitalizeSongNames('song of the year')).toBe('Song of the Year');
    expect(capitalizeSongNames('walk to the moon')).toBe('Walk to the Moon');
    expect(capitalizeSongNames('love and peace')).toBe('Love and Peace');
    expect(capitalizeSongNames('gone with the wind')).toBe('Gone with the Wind');
    expect(capitalizeSongNames('for whom the bell tolls')).toBe('For Whom the Bell Tolls');
  });

  // Test Case 6: Small words at the beginning (should be capitalized)
  test('should always capitalize the very first word, even if it is a small word', () => {
    expect(capitalizeSongNames('the long road')).toBe('The Long Road');
    expect(capitalizeSongNames('a new beginning')).toBe('A New Beginning');
    expect(capitalizeSongNames('of mice and men')).toBe('Of Mice and Men');
  });

  // Test Case 7: Mixed casing in input
  test('should correctly handle mixed casing in the input string', () => {
    expect(capitalizeSongNames('mY fAvOrItE sOnG')).toBe('My Favorite Song');
    expect(capitalizeSongNames('tHe QuIcK bRoWn FoX')).toBe('The Quick Brown Fox');
  });

  // Test Case 8: Leading/trailing spaces
  test('should trim leading and trailing spaces', () => {
    expect(capitalizeSongNames('  song title  ')).toBe('Song Title');
    expect(capitalizeSongNames(' single word ')).toBe('Single Word');
  });

  // Test Case 9: Multiple spaces between words
  test('should handle multiple spaces between words gracefully', () => {
    expect(capitalizeSongNames('song   with    many    spaces')).toBe('Song with Many Spaces');
    expect(capitalizeSongNames('test    of    the    string')).toBe('Test of the String');
  });

  // Test Case 10: Special characters (should be preserved)
  test('should preserve special characters', () => {
    expect(capitalizeSongNames('song! Title?')).toBe('Song! Title?');
    expect(capitalizeSongNames('rock & roll')).toBe('Rock & Roll');
  });

  // Test Case 11: Numbers in title
  test('should handle numbers in title', () => {
    expect(capitalizeSongNames('100 years')).toBe('100 Years');
    expect(capitalizeSongNames('number 9 dream')).toBe('Number 9 Dream');
  });

  // Test Case 12: Specific short words that should *not* be lowercased
  test('should capitalize short words not in the smallWords list', () => {
    expect(capitalizeSongNames('i am me')).toBe('I Am Me'); // 'i' and 'me' are not in smallWords
  });
});
