import { SidebarTrigger } from "@/components/ui/sidebar";
import PageWidthWrapper from "./PageWidthWrapper";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentHeaderProps {
  title?: ReactNode;
  controls?: ReactNode;
  headerContent?: ReactNode;
}

function PageContentHeader({
  title,
  controls,
  headerContent,
}: PageContentHeaderProps) {
  const hasHeaderContent = !!(title || controls || headerContent);
  return (
    <div
      className={cn(
        "border-border bg-accent lg:bg-transparent",
        hasHeaderContent && "border-b"
      )}
    >
      <PageWidthWrapper>
        <div
          className={`flex items-center justify-between gap-4 ${hasHeaderContent ? "h-12 sm:h-16" : "h-0"}`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {<SidebarTrigger className="-ml-1" />}
            {title && (
              <h1 className="min-w-0 text-xl font-semibold leading-7">
                {title}
              </h1>
            )}
          </div>
          <div>{controls}</div>
        </div>
      </PageWidthWrapper>
    </div>
  );
}

export default PageContentHeader;
