// src/test-utils.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender } from '@testing-library/react';
import React from 'react';

// Create a new QueryClient for each test run to ensure isolation
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries in tests
      staleTime: Infinity, // Keep data fresh for the duration of the test
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: ProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  );
}

const render = (ui: React.ReactElement, options?: any) =>
  rtlRender(ui, { wrapper: AllProviders, ...options });

// re-export everything from @testing-library/react
export * from '@testing-library/react';

// override render export
export { render };
