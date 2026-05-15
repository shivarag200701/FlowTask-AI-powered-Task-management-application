import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Drawer } from "vaul";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";
import type {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from "react";

export type ModalProps = PropsWithChildren<{
  showModal?: boolean;
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
}: ModalProps) {
  const { isMobile } = useMediaQuery();

  const closeModal = () => {
    onClose && onClose();

    if (setShowModal) {
      setShowModal(false);
    }
  };

  if (mobileOnly || isMobile) {
    return (
      <Drawer.Root
        open={setShowModal ? showModal : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-neutral-100 bg-opacity-10 backdrop-blur" />
          <Drawer.Content
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
              "fixed bottom-0 left-0 right-0 z-50 flex flex-col",
              "rounded-t-[10px] border-t border-neutral-200 bg-white",
              className
            )}
          >
            <div className="scrollbar-hide flex-1 overflow-y-auto  rounded-t-[10px] bg-inherit">
              <VisuallyHidden.Root>
                <Drawer.Title>Modal</Drawer.Title>
                <Drawer.Description>This is a modal</Drawer.Description>
              </VisuallyHidden.Root>
              <DrawerIsland />
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

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
            className
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

  function DrawerIsland() {
    return (
      <div className="sticky top-0 z-20 flex items-center justify-center rounded-t-[10px] bg-inherit">
        <div className="my-3 h-1 w-12 rounded-full bg-neutral-300" />
      </div>
    );
  }
}
