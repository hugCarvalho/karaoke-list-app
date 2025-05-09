import { capitalizeArtistNames } from '../../src/utils/strings.ts';

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
