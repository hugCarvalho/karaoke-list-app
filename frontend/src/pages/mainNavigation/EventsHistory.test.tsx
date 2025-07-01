import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../tests/utils/test-utils';

import { QueryClient, useQuery } from '@tanstack/react-query'; // <-- IMPORT useQuery directly
import * as api from '../../api/api';
import * as useCloseEventHook from '../../hooks/useCloseEvent';
import * as useCreateEventHook from '../../hooks/useCreateEvent';
import { EventsHistory } from './EventsHistory';

// Mock the entire @tanstack/react-query module to control its exports
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'), // Keep all actual exports
  useQuery: jest.fn(), // <-- Mock useQuery specifically
}));

// Mock the API calls
jest.mock('../../api/api', () => ({
  getEventsList: jest.fn(),
  createEvent: jest.fn(),
  closeEvent: jest.fn(),
}));

// Mock the custom hooks
jest.mock('../../hooks/useCreateEvent', () => ({
  useCreateEvent: jest.fn(),
}));

jest.mock('../../hooks/useCloseEvent', () => ({
  useCloseEvent: jest.fn(),
}));

// Mock EventCard
jest.mock('../../components/EventsCard', () => ({
  EventCard: ({ event }: { event: any }) => (
    <div data-testid={`event-card-${event._id}`}>
      {event.title} - {event.closed ? 'Closed' : 'Active'}
    </div>
  ),
}));

describe('EventsHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });
    (useCreateEventHook.useCreateEvent as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    (useCloseEventHook.useCloseEvent as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    })
  });

  afterEach(async () => {
    queryClient.clear();
  });

  const mockGetEventsList = (data: any[], isLoading = false, isFetching = false) => {
    (api.getEventsList as jest.Mock).mockResolvedValue(data);
    // Now you mock useQuery directly because you've mocked the module
    (useQuery as jest.Mock).mockReturnValue({
      data,
      isLoading,
      isFetching,
      error: null,
      refetch: jest.fn(),
      isSuccess: !isLoading && !isFetching && data !== undefined,
    });
  };

  const mockUseCreateEvent = (mutate: jest.Mock, isPending: boolean) => {
    (useCreateEventHook.useCreateEvent as jest.Mock).mockReturnValue({
      mutate,
      isPending,
    });
  };

  const mockUseCloseEvent = (mutate: jest.Mock, isPending: boolean) => {
    (useCloseEventHook.useCloseEvent as jest.Mock).mockReturnValue({
      mutate,
      isPending,
    });
  };

  test('renders loading spinner initially', () => {
    mockGetEventsList([], true, true);
    render(<EventsHistory />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Active Event')).not.toBeInTheDocument();
  });

  test('renders "Create Event" button when no active events and no history', async () => {
    mockGetEventsList([]);
    const mockCreateEventMutate = jest.fn();
    mockUseCreateEvent(mockCreateEventMutate, false);
    mockUseCloseEvent(jest.fn(), false);

    render(<EventsHistory />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('You have no events open. Create one?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
      expect(screen.queryByText('Active Event')).not.toBeInTheDocument();
      expect(screen.queryByText('Events History')).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /create event/i }));
    expect(mockCreateEventMutate).toHaveBeenCalledTimes(1);
  });

  test('renders active event and "Close Event" button when an event is open', async () => {
    const activeEvent = { _id: 'e1', title: 'Karaoke Night', closed: false };
    const closedEvent = { _id: 'e2', title: 'Old Karaoke', closed: true };
    mockGetEventsList([activeEvent, closedEvent]);

    const mockCloseEventMutate = jest.fn();
    mockUseCreateEvent(jest.fn(), false);
    mockUseCloseEvent(mockCloseEventMutate, false);

    render(<EventsHistory />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Active Event')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close event/i })).toBeInTheDocument();
      expect(screen.queryByText('You have no events open. Create one?')).not.toBeInTheDocument();

      // Get the specific EventCard element by its test ID
      const activeEventCard = screen.getByTestId(`event-card-${activeEvent._id}`);
      expect(activeEventCard).toHaveTextContent(activeEvent.title);
    });

    await userEvent.click(screen.getByRole('button', { name: /close event/i }));
    expect(mockCloseEventMutate).toHaveBeenCalledTimes(1);
  });

  test('renders event history when closed events exist', async () => {
    const closedEvent1 = { _id: 'e1', title: 'Past Gig', closed: true };
    const closedEvent2 = { _id: 'e2', title: 'Old Jam', closed: false };
    mockGetEventsList([closedEvent1, closedEvent2]);

    mockUseCreateEvent(jest.fn(), false);
    mockUseCloseEvent(jest.fn(), false);

    render(<EventsHistory />);

    await waitFor(() => {
      // First, ensure the loading spinner is gone, indicating data has loaded
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

      // Ensure the "Events History" heading is present
      expect(screen.getByText('Events History')).toBeInTheDocument();

      // Let's first ensure the event cards themselves are in the document
      const eventCard1 = screen.getByTestId(`event-card-${closedEvent1._id}`);
      const eventCard2 = screen.getByTestId(`event-card-${closedEvent2._id}`);
      expect(eventCard1).toBeInTheDocument();
      expect(eventCard2).toBeInTheDocument();

      // Now that we know the cards are there, assert their text content
      expect(eventCard1).toHaveTextContent(closedEvent1.title);
      expect(eventCard2).toHaveTextContent(closedEvent2.title);


      // Verify the order of the cards (based on .reverse() in component)
      const allEventCards = screen.getAllByTestId(/event-card-/i);
      expect(allEventCards[0]).toHaveTextContent(closedEvent2.title);
      expect(allEventCards[1]).toHaveTextContent(closedEvent1.title);

      // Assert other elements are NOT present
      expect(screen.queryByText('You have no events open. Create one?')).not.toBeInTheDocument();
    });
  });

  test('renders active event and history when both exist', async () => {
    const activeEvent = { _id: 'e1', title: 'Active Event', closed: false };
    const closedEvent = { _id: 'e2', title: 'Events History', closed: true };
    mockGetEventsList([activeEvent, closedEvent]);

    mockUseCreateEvent(jest.fn(), false);
    mockUseCloseEvent(jest.fn(), false);

    render(<EventsHistory />);

    await waitFor(() => {
      expect(screen.getByText('Active Event')).toBeInTheDocument();
      expect(screen.getByText(activeEvent.title)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close event/i })).toBeInTheDocument();

      expect(screen.getByText('Events History')).toBeInTheDocument();
      expect(screen.getByText(closedEvent.title)).toBeInTheDocument();
    });
  });

  test('Create Event button is disabled when pending', async () => {
    mockGetEventsList([]);
    mockUseCreateEvent(jest.fn(), true);
    mockUseCloseEvent(jest.fn(), false);

    render(<EventsHistory />);

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create event/i });
      expect(createButton).toBeDisabled();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('Close Event button is disabled when pending', async () => {
    const activeEvent = { _id: 'e1', title: 'Active Karaoke', closed: false };
    mockGetEventsList([activeEvent]);
    mockUseCreateEvent(jest.fn(), false);
    mockUseCloseEvent(jest.fn(), true);

    render(<EventsHistory />);

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close event/i });
      expect(closeButton).toBeDisabled();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('renders PageHeader with correct title and tooltip', () => {
    mockGetEventsList([]);
    mockUseCreateEvent(jest.fn(), false);
    mockUseCloseEvent(jest.fn(), false);

    render(<EventsHistory />);
    expect(screen.getByRole('heading', { name: "Performances" })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Events History' })).not.toBeInTheDocument();
  });
});
