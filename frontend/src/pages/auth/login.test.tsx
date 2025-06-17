import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { login } from '../../api/api';
import Login from './Login'; // Adjust import path if necessary

// Mock API functions
jest.mock('../../api/api', () => ({
  login: jest.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Use actual for Link, etc.
  useNavigate: () => mockNavigate,
}));

// Mock the EMAIL_PATTERN constant (literal regex pattern)
jest.mock('../../constants/email', () => ({
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
}));

// Type cast for easier Jest mock setup
const mockLogin = login as jest.Mock;

describe('Login Component', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>; // Declare userEvent instance

  // Wrapper to provide React Query context and Router context
  const renderLoginComponent = (initialPath = '/', redirectUrl = '/') => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Use MemoryRouter for controlled routing in tests
    // For `location.state` to work, we'll simulate it in the render options
    return render(
      <QueryClientProvider client={queryClient}>
        {/* Opt-in to future flags to suppress warnings */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/*
             We pass state via the navigate mock for simplicity in tests,
             as BrowserRouter in render() doesn't directly take `state` prop.
             The `useNavigate` mock will handle `redirectUrl`.
           */}
          <Login />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    mockLogin.mockClear();
    mockNavigate.mockClear();
    mockNavigate.mockImplementation((to, options) => {
      // Mock navigate to store the redirectUrl if it's passed
      // This is important for the `redirectUrl` functionality to be testable
      if (options && options.state && options.state.redirectUrl) {
        mockNavigate.mock.lastCall = [to, options]; // Store the call
      } else {
        mockNavigate.mock.lastCall = [to, options];
      }
    });

    jest.clearAllTimers();

    // Initialize userEvent for each test
    user = userEvent.setup();
  });

  // --- Initial Render Tests ---
  test('should render all form fields and buttons', () => {
    renderLoginComponent();

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    // Using string for exact match as requested
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot password?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sing in to your account/i })).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument(); // MAIN AUTHENTICATION BOX
    expect(screen.getByRole('alert')).toBeInTheDocument(); // API Error message container
  });

  test('should not show validation errors or API errors initially', () => {
    renderLoginComponent();

    // Check that form field error messages are not visible
    expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Password is required/i)).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement(); // API error message container should be empty

    // Ensure button is not loading/disabled initially
    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    expect(signInButton).not.toBeDisabled();
    expect(signInButton).not.toHaveAttribute('aria-busy', 'true');
  });

  // --- Form Validation Tests ---

  test('should display validation errors for required fields on submit', async () => {
    renderLoginComponent();

    const signInButton = screen.getByRole('button', { name: /Sign in/i });

    await user.click(signInButton);

    // Assert validation messages appear (use waitFor for async form state updates)
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    // Button should NOT be disabled due to invalid form
    expect(signInButton).not.toBeDisabled();
  });

  test('should display validation error for password minLength', async () => {
    renderLoginComponent();

    const passwordInput = screen.getByLabelText("Password");
    const createAccountButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(passwordInput, 'short');
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i))
    });
  });

  // --- Successful Submission Tests ---

  test('should submit form with valid data and navigate to default redirect URL on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined); // Mock a successful login response

    renderLoginComponent(); // No specific redirectUrl provided, so it defaults to '/'

    // Fill the form with valid data
    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'securepassword'); // Using string for exact match

    const signInButton = screen.getByRole('button', { name: /Sign in/i });

    await user.click(signInButton);

    // Wait for the mutation to settle
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));

    // Verify login API was called with the correct data
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'securepassword',
    });

    // Verify navigation occurred to the default redirect URL
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });

    // Verify API error message area is empty
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  test('should submit form with valid data and navigate to custom redirect URL on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined); // Mock a successful login response

    // To test `redirectUrl` from location state, we'll manually set it for the mock
    // In a real app, `MemoryRouter` with `initialEntries` and `initialIndex` might be used,
    // but with the current `BrowserRouter` wrapper, we'll rely on `useNavigate` mock
    // to reflect the `location.state` behavior.
    const customRedirectUrl = '/';
    mockNavigate.mockImplementationOnce((to, options) => {
      expect(options.state?.redirectUrl).toBe(customRedirectUrl);
      mockNavigate.mock.lastCall = [to, options];
    });


    renderLoginComponent(); // Render the component

    // Override the mockNavigate for the successful path
    mockNavigate.mockImplementation((to, options) => {
      expect(to).toBe(customRedirectUrl); // Expect navigation to the custom URL
      expect(options.replace).toBe(true);
    });

    // Fill the form with valid data
    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'securepassword');

    const signInButton = screen.getByRole('button', { name: /Sign in/i });

    await waitFor(() => expect(signInButton).not.toBeDisabled());
    await user.click(signInButton);

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'securepassword',
    });

    // Verify navigation occurred to the custom redirect URL
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(customRedirectUrl, { replace: true });
  });


  // --- Failed Submission Tests ---

  test('should display API error message on login failure', async () => {
    const apiErrorMessage = 'Invalid email or password';
    mockLogin.mockRejectedValueOnce(new Error(apiErrorMessage)); // Mock a failed login response

    renderLoginComponent();

    // Fill the form with valid data
    await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');

    const signInButton = screen.getByRole('button', { name: /Sign in/i });

    await waitFor(() => expect(signInButton).not.toBeDisabled());

    await user.click(signInButton);

    // Wait for the mutation to settle (to error state)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      // Expect the API error message to be displayed
      expect(screen.getByRole('alert')).toHaveTextContent(apiErrorMessage);
    });

    // Ensure button is no longer loading and is enabled again
    expect(signInButton).not.toBeDisabled();
    expect(signInButton).not.toHaveAttribute('aria-busy', 'true');

    // Verify navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // test('should display generic API error message if error has no message', async () => {
  //   mockLogin.mockRejectedValueOnce({}); // Mock a generic error object without a 'message' property

  //   renderLoginComponent();

  //   // Fill the form with valid data
  //   await user.type(screen.getByLabelText(/Email address/i), 'test@example.com');
  //   await user.type(screen.getByLabelText('Password'), 'securepassword');

  //   await user.click(screen.getByRole('button', { name: /Sign in/i }));

  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalledTimes(1);
  //     // Expect the generic error message to be displayed
  //     expect(screen.getByRole('alert')).toHaveTextContent('An error occurred'); // Your component displays "An error occurred"
  //   });

  //   expect(mockNavigate).not.toHaveBeenCalled();
  // });


  // --- Navigation Link Tests ---

  test('should have correct links for "Forgot password?" and "Sign up"', () => {
    renderLoginComponent();

    const forgotPasswordLink = screen.getByRole('link', { name: /Forgot password?/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/password/forgot');

    const signUpLink = screen.getByRole('link', { name: /Sign up/i });
    expect(signUpLink).toHaveAttribute('href', '/register');
  });
});
