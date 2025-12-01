import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that uses useAuth
const TestComponent = () => {
  const { user, loading, error, login, logout, signup } = useAuth();

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user && <div>User: {user.username}</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={() => login('player1', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => signup('newuser', 'password')}>Signup</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset any auth state between tests
  });

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should login user successfully', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /Login/ });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('User: player1')).toBeInTheDocument();
    });
  });

  it('should logout user', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /Login/ });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('User: player1')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /Logout/ });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.queryByText(/User:/)).not.toBeInTheDocument();
    });
  });

  it('should handle login errors', async () => {
    const FailLoginComponent = () => {
      const { error, login } = useAuth();
      return (
        <div>
          {error && <div>Error: {error}</div>}
          <button onClick={() => login('invalid', 'invalid')}>Login</button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <FailLoginComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /Login/ });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    const consoleError = console.error;
    console.error = () => {}; // Suppress error output

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');

    console.error = consoleError;
  });
});
