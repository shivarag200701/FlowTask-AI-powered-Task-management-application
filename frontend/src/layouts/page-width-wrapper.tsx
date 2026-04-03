import type { PropsWithChildren } from "react";

function PageWidthWrapper({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 md:px-6">{children}</div>
  );
}

export default PageWidthWrapper;
