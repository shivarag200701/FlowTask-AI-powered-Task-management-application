import {
  useContext,
  createContext,
  type ReactNode,
  useState,
  useEffect,
  useRef
} from "react";
import api from "../utils/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const authMethods = [
  "google",
  "email"
] as const

export type AuthMethod = (typeof authMethods)[number]

interface AuthProps {
  children: ReactNode;
}
interface ContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  setLastUsedAuthMethod: (value: AuthMethod | undefined) => void ;
  lastUsedAuthMethod: AuthMethod | undefined
  email: string | undefined

}
const AuthContext = createContext<ContextProps>({
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: async () => {},
  setLastUsedAuthMethod: () => {},
  lastUsedAuthMethod: undefined,
  email: undefined
});

export function AuthProvider({ children }: AuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email,setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true);

  const [lastUsedAuthMethodLive,setLastUsedAuthMethod] = useLocalStorage<AuthMethod | undefined>("last-used-auth-method",undefined)

  const {current: lastUsedAuthMethod} = useRef<AuthMethod | undefined>(lastUsedAuthMethodLive)




    async function fetchUserSession() {
      try {
        const user = await api.get("/v1/auth-check")
        if (user.data.isAuthenticated == "true") {
          setIsAuthenticated(true);
          setEmail(user.data.email)
        }
        if (user.data.isAuthenticated == "false") {
          setIsAuthenticated(false);
          setEmail(user.data.email)
        }
        setIsLoading(false);
      } catch (error) {
        console.error("error while checking validation", error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
    useEffect(() => {
      fetchUserSession();
    }, []);
    
    const refreshAuth = async () => {
      setIsLoading(true);
      await fetchUserSession();
    };
    

  const value = { isAuthenticated, isLoading, refreshAuth, setLastUsedAuthMethod, lastUsedAuthMethod, email };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//for cretaing protected routes
export const Auth = () => useContext(AuthContext);
