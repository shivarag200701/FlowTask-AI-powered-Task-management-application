import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import PageWidthWrapper from "@/layouts/page-width-wrapper";
import { cn } from "@/lib/utils";

function DashboardPage({ className }: { className?: string }) {
  const { width } = useMediaQuery();
  return (
    <div className={cn(`bg-neutral-200 w-full lg:py-2 lg:pr-2`, className)}>
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        <PageWidthWrapper>
          {width && width < 1024 && <SidebarTrigger className="-ml-1" />}
        </PageWidthWrapper>
      </div>
    </div>
  );
}

export default DashboardPage;
