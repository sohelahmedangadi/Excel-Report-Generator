import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    if (token) {
      authAPI.me()
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('ds_token'))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password });
    localStorage.setItem('ds_token', r.data.token);
    setUser(r.data.user);
  };

  const register = async (name, email, password) => {
    const r = await authAPI.register({ name, email, password });
    localStorage.setItem('ds_token', r.data.token);
    setUser(r.data.user);
  };

  const logout = () => { localStorage.removeItem('ds_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

