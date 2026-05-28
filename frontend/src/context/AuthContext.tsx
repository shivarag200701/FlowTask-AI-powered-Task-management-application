import {
  useContext,
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type PropsWithChildren,
} from "react";
import api from "@/utils/functions/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

export const authMethods = ["google", "email"] as const;

export type AuthMethod = (typeof authMethods)[number];

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
const authContext = createContext<ContextProps>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  setEmail: () => {},
  isLoading: true,
  refreshAuth: async () => {},
  setLastUsedAuthMethod: () => {},
  lastUsedAuthMethod: undefined,
  email: undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUsedAuthMethodLive, setLastUsedAuthMethod] = useLocalStorage<
    AuthMethod | undefined
  >("last-used-auth-method", undefined);

  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive
  );

  async function fetchUserSession() {
    //check session in backend everytime
    setIsLoading(true);
    try {
      const { data } = await api.get("/api/v1/auth-check");
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

  // 401 interceptor — show toast when session expires
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes("auth-check")
        ) {
          setIsAuthenticated(false);
          toast.error("Your session has expired", {
            id: "session-expired",
            duration: Infinity,
            action: {
              label: "Go to login",
              onClick: () => {
                window.location.href = "/signin";
              },
            },
          });
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
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

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(authContext);
