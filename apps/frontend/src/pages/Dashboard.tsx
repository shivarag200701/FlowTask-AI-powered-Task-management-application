import PageContentHeader from "@/layouts/PageContentHeader";
import { cn } from "@/lib/utils";

function DashboardPage({ className }: { className?: string }) {
  return (
    <div className={cn(`bg-neutral-200 w-full lg:py-2 lg:pr-2`, className)}>
      {/* create compoent for header*/}
      <div className="bg-white h-full lg:rounded-xl">
        <PageContentHeader title="Today" />
      </div>
    </div>
  );
}

export default DashboardPage;
