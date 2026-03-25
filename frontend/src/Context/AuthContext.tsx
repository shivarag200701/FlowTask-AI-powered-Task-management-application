import {
  useContext,
  createContext,
  type ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import api from "../utils/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const authMethods = ["google", "email"] as const;

export type AuthMethod = (typeof authMethods)[number];

interface AuthProps {
  children: ReactNode;
}
interface ContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setEmail: (email: string) => void;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  setLastUsedAuthMethod: (value: AuthMethod | undefined) => void;
  lastUsedAuthMethod: AuthMethod | undefined;
  email: string | undefined;
}
const AuthContext = createContext<ContextProps>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  setEmail: () => {},
  isLoading: true,
  refreshAuth: async () => {},
  setLastUsedAuthMethod: () => {},
  lastUsedAuthMethod: undefined,
  email: undefined,
});

export function AuthProvider({ children }: AuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUsedAuthMethodLive, setLastUsedAuthMethod] = useLocalStorage<
    AuthMethod | undefined
  >("last-used-auth-method", undefined);

  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive,
  );

  async function fetchUserSession() {
    //check session in backend everytime
    setIsLoading(true);
    try {
      const { data } = await api.get("/v1/auth-check");
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated) {
        setEmail(data.email);
      }
    } catch (error) {
      console.error("error while gettting session from backend", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchUserSession();
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchUserSession();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    refreshAuth,
    setLastUsedAuthMethod,
    lastUsedAuthMethod,
    email,
    setEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(AuthContext);
