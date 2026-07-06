import PageWidthWrapper from "@/layouts/PageWidthWrapper";

function MemberRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200" />
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded bg-neutral-200" />
          <div className="h-3 w-40 rounded bg-neutral-200" />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-30">
        <div className="h-8 w-[100px] rounded-md bg-neutral-200" />
        <div className="h-8 w-8 rounded-md bg-neutral-200" />
      </div>
    </div>
  );
}

export default function WorkspaceMembersSkeleton() {
  return (
    <PageWidthWrapper className="max-w-7xl py-8 space-y-8 px-0">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-neutral-200 animate-pulse" />
        </div>
        <div className="rounded-xl border border-border divide-y divide-border">
          <MemberRowSkeleton />
          <MemberRowSkeleton />
          <MemberRowSkeleton />
        </div>
      </div>
    </PageWidthWrapper>
  );
}
