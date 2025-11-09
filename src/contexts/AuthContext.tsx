import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getAuthToken,
  getUser,
  setAuthToken,
  setUser,
  removeAuthToken,
} from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("❌ useAuth called outside of AuthProvider!");
    console.error(
      "❌ Make sure the component using useAuth is wrapped in <AuthProvider>"
    );
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const existingToken = getAuthToken();
    const existingUser = getUser();

    if (existingToken && existingUser) {
      setTokenState(existingToken);
      setUserState(existingUser);
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    console.log("🔐 AuthContext: Logging in user:", newUser);

    // Store in localStorage first (synchronous)
    setAuthToken(newToken);
    setUser(newUser);

    // Then update React state (asynchronous)
    setTokenState(newToken);
    setUserState(newUser);

    console.log("✅ AuthContext: User logged in, token and user stored");
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setUserState(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
