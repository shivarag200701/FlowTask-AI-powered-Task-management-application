import { cn } from "@/lib/utils";
import * as PopoverPrimative from "@radix-ui/react-popover";
import type { PropsWithChildren, ReactNode } from "react";
import { motion } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer } from "vaul";

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
}: PopoverProps) => {
  const { isMobile } = useMediaQuery();

  if (isMobile || mobileOnly) {
    return (
      <Drawer.Root open={openPopover} onOpenChange={setOpenPopover}>
        <Drawer.Trigger className="sm:hidden" asChild>
          {children}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="bg-bg-subtle fixed inset-0 z-50 bg-opacity-10 backdrop-blur" />
          <Drawer.Content
            className="border-border-subtle bg-bg-default fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t"
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
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-background">
              <div className="bg-border my-3 h-1 w-12 rounded-full" />
            </div>
            <div className="bg-background flex w-full items-center justify-center overflow-hidden pb-4 align-middle shadow-xl">
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
          collisionPadding={{ left: 20 }}
          side={side}
          align={align}
          alignOffset={0}
          className={cn(
            "animate-slide-up-fade border border-border bg-white rounded-md z-50 items-center sm:block",
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
