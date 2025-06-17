import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { signup } from '../../api/api';
import Register from './Register'; // Adjust import path if necessary

// Mock API functions
jest.mock('../../api/api', () => ({
  signup: jest.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the EMAIL_PATTERN constant (use the literal regex pattern)
jest.mock('../../constants/email', () => ({
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
}));

// Type cast for easier Jest mock setup
const mockSignup = signup as jest.Mock;

describe('Register Component', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>; // Declare userEvent instance

  const renderRegisterComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Register />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockSignup.mockClear();
    mockNavigate.mockClear();
    jest.clearAllTimers();
    user = userEvent.setup(); // Initialize userEvent for each test
  });

  // --- Initial Render Tests ---
  test('should render all form fields and buttons', () => {
    renderRegisterComponent();

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot password?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('should not show validation errors or API errors initially', () => {
    renderRegisterComponent();

    expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Password is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Confirm password is required/i)).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();

    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });
    expect(createAccountButton).not.toBeDisabled();
    expect(createAccountButton).not.toHaveAttribute('aria-busy', 'true');
  });

  // --- Form Validation Tests ---

  // Trigger validation by clicking submit on an empty form
  test('should display validation errors for required fields on submit', async () => {
    renderRegisterComponent();

    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

    await user.click(createAccountButton);

    // Assert validation messages appear
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(screen.getByText(/Confirm password is required/i)).toBeInTheDocument();
    });

    expect(createAccountButton).toBeEnabled();
  });

  test('should display validation error for password minLength', async () => {
    renderRegisterComponent();
    const passwordInput = screen.getByLabelText("Password");
    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

    await user.type(passwordInput, 'short');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i))
    });
  });

  test('should display validation error if passwords do not match', async () => {
    renderRegisterComponent();
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

    await user.type(passwordInput, 'securepassword');
    await user.type(confirmPasswordInput, 'mismatch');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    await user.clear(confirmPasswordInput)
    await user.type(confirmPasswordInput, 'securepassword');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/Passwords do not match/i)).not.toBeInTheDocument();
    });
  });

  // --- Successful Submission Tests ---

  test('should submit form with valid data and navigate on success', async () => {
    mockSignup.mockResolvedValueOnce(undefined);

    renderRegisterComponent();

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText("Password"), 'securepassword');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'securepassword');

    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });
    await user.click(createAccountButton);

    await waitFor(() => expect(mockSignup).toHaveBeenCalledTimes(1));
    expect(mockSignup).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'securepassword',
      confirmPassword: 'securepassword',
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });

    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  // --- Failed Submission Tests ---

  test('should display API error message on signup failure', async () => {
    const apiErrorMessage = 'Email already exists.';
    mockSignup.mockRejectedValueOnce(new Error(apiErrorMessage));

    renderRegisterComponent();

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText("Password"), 'securepassword');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'securepassword');

    const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

    await waitFor(() => expect(createAccountButton).not.toBeDisabled());

    await user.click(createAccountButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('alert')).toHaveTextContent(apiErrorMessage);
    });

    expect(createAccountButton).not.toBeDisabled();
    expect(createAccountButton).not.toHaveAttribute('aria-busy', 'true');

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should display generic API error message if error has no message', async () => {
    mockSignup.mockRejectedValueOnce({});

    renderRegisterComponent();

    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText("Password"), 'securepassword');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'securepassword');

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('alert')).toHaveTextContent('An error occurred');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Navigation Link Tests ---

  test('should have correct links for "Forgot password?" and "Sign in"', () => {
    renderRegisterComponent();

    const forgotPasswordLink = screen.getByRole('link', { name: /Forgot password?/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/password/forgot');

    const signInLink = screen.getByRole('link', { name: /Sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login');
  });
});
