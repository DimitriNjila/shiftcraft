import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/** Fresh QueryClient per test — no shared cache, retries disabled. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface Options extends RenderOptions {
  initialEntries?: string[];
}

/**
 * Wraps UI in the providers every page component needs:
 * QueryClient + MemoryRouter (no AuthProvider — mock useAuth per test instead).
 */
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...options }: Options = {},
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/** Default mock return value for useAuth — override per test with mockReturnValue. */
export const mockAuthValue = {
  session: null,
  user: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};
