import { cn } from "@/lib/utils";
import * as PopoverPrimative from "@radix-ui/react-popover";
import type { PropsWithChildren, ReactNode } from "react";
import { motion } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer } from "vaul";
import { VisuallyHidden } from "radix-ui";

export type PopoverProps = PropsWithChildren<{
  openPopover: boolean;
  setOpenPopover: (open: boolean) => void;
  children: ReactNode;
  content: ReactNode;
  sideOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | Element[];
  side?: "top" | "right" | "bottom" | "left";
  popoverContentClassName?: string;
  align?: "start" | "center" | "end";
  mobileOnly?: boolean;
  collisionPadding?: number;
}>;

export const Popover = ({
  openPopover,
  setOpenPopover,
  children,
  content,
  sideOffset = 8,
  avoidCollisions = true,
  collisionBoundary,
  side = "bottom",
  popoverContentClassName,
  align = "center",
  mobileOnly,
  collisionPadding = 8,
}: PopoverProps) => {
  const { isMobile } = useMediaQuery();

  if (isMobile || mobileOnly) {
    return (
      <Drawer.Root open={openPopover} onOpenChange={setOpenPopover}>
        <Drawer.Trigger className="sm:hidden" asChild>
          {children}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content
            className="border-border-subtle bg-bg-default fixed bottom-0 left-0 right-0 flex flex-col z-50 mt-24 rounded-t-[10px] border-t"
            onPointerDownOutside={(e) => {
              // Prevent dismissal when clicking inside a toast
              if (
                e.target instanceof Element &&
                e.target.closest("[data-sonner-toast]")
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="scrollbar-hide flex-1 overflow-y-auto  rounded-t-[10px] bg-white">
              <VisuallyHidden.Root>
                <Drawer.Title>Modal</Drawer.Title>
                <Drawer.Description>This is a modal</Drawer.Description>
              </VisuallyHidden.Root>
              <DrawerIsland />
              {content}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <PopoverPrimative.Root open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverPrimative.Trigger asChild className="text-black">
        {children}
      </PopoverPrimative.Trigger>
      <PopoverPrimative.Portal>
        <PopoverPrimative.Content
          sideOffset={sideOffset}
          avoidCollisions={avoidCollisions}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          side={side}
          align={align}
          alignOffset={0}
          className={cn(
            "animate-slide-up-fade bg-white border border-border outline-none  rounded-md z-50 items-center sm:block shadow-md",
            popoverContentClassName,
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            {content}
          </motion.div>
        </PopoverPrimative.Content>
      </PopoverPrimative.Portal>
    </PopoverPrimative.Root>
  );
};

function DrawerIsland() {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-center rounded-t-[10px] bg-inherit">
      <div className="my-3 h-1 w-12 rounded-full bg-neutral-300" />
    </div>
  );
}
