import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

function DashboardPage({ className }: { className: string }) {
  const { width } = useMediaQuery();
  return (
    <div className={cn(`bg-neutral-200 w-full lg:py-2 lg:pr-2`, className)}>
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        {width && width < 1024 && <SidebarTrigger className="-ml-1" />}
      </div>
    </div>
  );
}

export default DashboardPage;
