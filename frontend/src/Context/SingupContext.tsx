import { useContext, createContext, useState } from "react";

export interface SignupContext{
    email: string,
    password: string,
    step: "signup" | "verify",
    setEmail: (email:string) => void,
    setPassword: (password: string) => void
    setStep: (step: "signup"|"verify") => void
}


const SignupContext = createContext<SignupContext | undefined>(undefined)

export function SignupProvider({children}:React.PropsWithChildren){
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [step,setStep] = useState<"signup"|"verify">("signup")

    return(
         <SignupContext.Provider 
            value={{
                email,
                password,
                step,
                setEmail,
                setPassword,
                setStep
            }}
         >
            {children}
         </SignupContext.Provider>
        )
}

export const useSignupContext = () => {
    const context = useContext(SignupContext)

    if (context === undefined) {
        throw new Error(
          "useRegisterContext must be used within a RegisterProvider",
        );
      }
    
      return context;
}