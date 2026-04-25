import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type SideNavContext = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const sideNavContext = createContext<SideNavContext>({
  isOpen: false,
  setIsOpen: () => {},
});

export function SideNavProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <sideNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </sideNavContext.Provider>
  );
}

export function useSideNavContext() {
  const context = useContext(sideNavContext);
  if (context === undefined) {
    throw new Error(
      "useRegisterContext must be used within a RegisterProvider",
    );
  }

  return context;
}
