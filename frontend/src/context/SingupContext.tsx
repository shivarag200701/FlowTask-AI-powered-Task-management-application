import {
  useContext,
  createContext,
  useState,
  type PropsWithChildren,
} from "react";

interface SignupContextProps {
  email: string;
  password: string;
  step: "signup" | "verify";
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setStep: (step: "signup" | "verify") => void;
}

const signupContext = createContext<SignupContextProps | undefined>(undefined);

export function SignupProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"signup" | "verify">("signup");

  return (
    <signupContext.Provider
      value={{
        email,
        password,
        step,
        setEmail,
        setPassword,
        setStep,
      }}
    >
      {children}
    </signupContext.Provider>
  );
}

export const useSignupContext = () => {
  const context = useContext(signupContext);

  if (context === undefined) {
    throw new Error(
      "useRegisterContext must be used within a RegisterProvider",
    );
  }

  return context;
};
