/**
 * AuthContext — global state that almost every screen needs (who is signed in)
 * but that changes rarely. Context API is the right tool: no extra library,
 * and the value only changes on login / logout.
 *
 * Front-end-only demo: accounts live in localStorage and the Google/Facebook
 * buttons are simulated (a real version needs a backend to verify tokens).
 * Storage keys are unchanged from Evaluation 1.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const USERS_KEY = 'ironledger_users_v1';
const SESSION_KEY = 'ironledger_session_v1';

const AuthContext = createContext(null);

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('User load failed', err);
    return [];
  }
}
function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('User save failed', err);
    throw new Error('Could not save your account — browser storage is unavailable');
  }
}
function setSession(username) {
  try {
    localStorage.setItem(SESSION_KEY, username);
  } catch (err) {
    console.error('Session save failed', err);
  }
}
function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
function readSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Never put the password into React state. */
const toPublicUser = (account) => ({
  username: account.username,
  email: account.email,
  displayName: account.displayName || account.username,
  provider: account.provider || 'email',
});

export function AuthProvider({ children }) {
  // lazy initial state: runs once, restores the session after a page refresh
  const [user, setUser] = useState(() => {
    const session = readSession();
    if (!session) return null;
    const account = loadUsers().find((u) => u.username === session);
    return account ? toPublicUser(account) : null;
  });

  const register = useCallback(async ({ username, email, password }) => {
    const users = loadUsers();
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase()))
      throw new Error('That username is already taken.');
    if (users.some((u) => u.email && u.email.toLowerCase() === email.trim().toLowerCase()))
      throw new Error('An account with that email already exists.');
    const account = { username: username.trim(), email: email.trim(), password };
    saveUsers([...users, account]);
    setSession(account.username);
    setUser(toPublicUser(account));
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const account = loadUsers().find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
    );
    if (!account) throw new Error('Username or password is incorrect.');
    setSession(account.username);
    setUser(toPublicUser(account));
  }, []);

  const socialLogin = useCallback(async (provider) => {
    // Simulated OAuth — see the note at the top of this file.
    const username = `${provider}_demo_user`;
    const users = loadUsers();
    let account = users.find((u) => u.username === username);
    if (!account) {
      account = {
        username,
        email: `${provider}.demo@example.com`,
        password: null,
        provider,
        displayName: provider === 'google' ? 'Google User' : 'Facebook User',
      };
      saveUsers([...users, account]);
    }
    setSession(username);
    setUser(toPublicUser(account));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // memoised so consumers only re-render when `user` actually changes
  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, register, login, socialLogin, logout }),
    [user, register, login, socialLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
