import { readable, derived } from "svelte/store";

// Breakpoints (can be adjusted to match your needs)
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 800;

export default function useViewport() {
  // Create a readable store for window width
  const windowWidth = readable(
    typeof window !== "undefined" ? window.innerWidth : 0,
    (set) => {
      if (typeof window === "undefined") return;

      const handleResize = () => {
        set(window.innerWidth);
      };

      // Set initial value
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  );

  // Derive device type stores
  const isMobile = derived(
    windowWidth,
    ($width) => $width <= MOBILE_BREAKPOINT
  );
  const isTablet = derived(
    windowWidth,
    ($width) => $width > MOBILE_BREAKPOINT && $width <= TABLET_BREAKPOINT
  );
  const isDesktop = derived(
    windowWidth,
    ($width) => $width > TABLET_BREAKPOINT
  );

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
  };
}
