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

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export type AuthMethod = (typeof authMethods)[number];

interface ContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  setLastUsedAuthMethod: (value: AuthMethod | undefined) => void;
  lastUsedAuthMethod: AuthMethod | undefined;
  email: string | undefined;
}
const authContext = createContext<ContextProps>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoading: true,
  refreshAuth: async () => {},
  setLastUsedAuthMethod: () => {},
  lastUsedAuthMethod: undefined,
  email: undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");

  const [email, setEmail] = useState("");
  const isAuthenticated = authStatus === "authenticated";
  const isLoading = authStatus === "unknown";
  const [lastUsedAuthMethodLive, setLastUsedAuthMethod] = useLocalStorage<
    AuthMethod | undefined
  >("last-used-auth-method", undefined);

  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive
  );

  const login = useCallback((email: string) => {
    setAuthStatus("authenticated");
    setEmail(email);
  }, []);

  const logout = useCallback(() => {
    setAuthStatus("unauthenticated");
    setEmail("");
  }, []);

  async function fetchUserSession(silent = false) {
    if (!silent) setAuthStatus("unknown");
    try {
      const { data } = await api.get("/api/v1/auth-check");
      if (data.isAuthenticated) {
        setAuthStatus("authenticated");
        setEmail(data.email);
      } else {
        setAuthStatus("unauthenticated");
      }
    } catch {
      setAuthStatus("unauthenticated");
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
          setAuthStatus("unauthenticated");
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
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchUserSession(true);
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    setLastUsedAuthMethod,
    lastUsedAuthMethod,
    email,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(authContext);
