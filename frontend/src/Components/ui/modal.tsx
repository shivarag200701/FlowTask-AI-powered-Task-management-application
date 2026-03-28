import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";
import type {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from "react";

export type DialogProps = PropsWithChildren<{
  showModal: boolean;
  setShowModal?: Dispatch<SetStateAction<boolean>>;
  children?: ReactNode;
  mobileOnly?: boolean;
  className?: string;
  onClose?: () => void;
}>;

export function Modal({
  showModal,
  setShowModal,
  children,
  mobileOnly,
  className,
  onClose,
}: DialogProps) {
  const { isMobile } = useMediaQuery();

  if (mobileOnly || isMobile) {
    //Use vaul drawer component
  }

  const closeModal = () => {
    onClose && onClose();

    if (setShowModal) {
      setShowModal(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-bg-subtle fixed inset-0 z-30 bg-opacity-10 backdrop-blur" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            // Prevent dismissal when clicking inside a toast
            if (
              e.target instanceof Element &&
              e.target.closest("[data-sonner-toast]")
            ) {
              e.preventDefault();
            }
          }}
          className={cn(
            "fixed inset-0 z-40 m-auto h-fit w-full max-w-md",
            "border border-neutral-200 bg-white p-0 shadow-xl sm:rounded-2xl",
            "scrollbar-hide animate-scale-in overflow-y-auto",
            className,
          )}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Modal</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              This is a modal
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
