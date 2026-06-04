import { useState } from "react";

export function useScrollBoundary() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAtTop(scrollTop === 0);
    setAtBottom(scrollHeight - clientHeight - scrollTop <= 1);
  };

  return { atTop, atBottom, handleScroll };
}
