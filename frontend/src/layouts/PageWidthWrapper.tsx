import type { PropsWithChildren } from "react";

function PageWidthWrapper({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-3 md:px-6">
      {children}
    </div>
  );
}

export default PageWidthWrapper;
