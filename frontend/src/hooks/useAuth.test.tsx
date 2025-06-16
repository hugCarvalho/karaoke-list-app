import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { getUser } from '../api/api';
import { useAuth } from './useAuth';

// Mock the getUser API function
jest.mock('../api/api', () => ({
  getUser: jest.fn(),
}));

const TestComponent = ({ options }: { options?: Parameters<typeof useAuth>[0] }) => {
  const { user, isLoading, isError, error } = useAuth(options);
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{isError.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : ''}</div>
      <div data-testid="errorMessage">{error ? error.message : ''}</div>
    </div>
  );
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithClient = (ui: React.ReactElement) => {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAuth', () => {
  it('returns correct loading state', async () => {
    (getUser as jest.Mock).mockResolvedValueOnce(null); // use null instead of undefined

    renderWithClient(<TestComponent />);

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('error').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('');
    expect(screen.getByTestId('errorMessage').textContent).toBe('');
  });

  it('returns correct user data on success', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    (getUser as jest.Mock).mockResolvedValueOnce(mockUser);

    renderWithClient(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('error').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(mockUser));
    expect(screen.getByTestId('errorMessage').textContent).toBe('');
  });

  it('returns correct error state on failure', async () => {
    const mockError = new Error('Failed to fetch user');
    (getUser as jest.Mock).mockRejectedValueOnce(mockError);

    renderWithClient(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('error').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('');
    expect(screen.getByTestId('errorMessage').textContent).toBe(mockError.message);
  });

  it('does not run the query when enabled is false', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    (getUser as jest.Mock).mockResolvedValueOnce(mockUser);

    renderWithClient(<TestComponent options={{ enabled: false }} />);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('error').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('');
    expect(screen.getByTestId('errorMessage').textContent).toBe('');
  });
});
