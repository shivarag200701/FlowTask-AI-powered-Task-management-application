import { useEffect, useState } from "react";

function getDevice(): "mobile" | "tablet" | "desktop" | null {
  if (typeof window === "undefined") return null;

  const device = window.matchMedia("(min-width:1024px)").matches
    ? "desktop"
    : window.matchMedia("(min-width:640px)").matches
      ? "tablet"
      : "mobile";
  return device;
}

function getDimensions(): {
  width: number;
  height: number;
} | null {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useMediaQuery() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop" | null>(
    getDevice()
  );

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(getDimensions());

  useEffect(() => {
    const checkDevice = () => {
      setDevice(getDevice());
      setDimensions(getDimensions());
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return {
    device,
    width: dimensions?.width,
    height: dimensions?.height,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };
}
