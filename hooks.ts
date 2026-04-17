import React from "react";

export function useKeyPress(onKey: () => void, keys: string[], active: boolean) {
  React.useEffect(() => {
    if (!active) return; // Don't add the listener if backdrop is hidden
    const handleKey = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) onKey();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onKey, active, keys]);
};

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

export function usePortal(id:string = "default-portal") {
  const [wrapperElement, setWrapperElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    let element = document.getElementById(id);
    let systemCreated = false;

    if (!element) {
      systemCreated = true;
      element = document.createElement("div");
      element.setAttribute("id", id);
      document.body.appendChild(element);
    }

    setWrapperElement(element);

    // Clean up: Only remove the element if THIS hook instance created it
    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [id]);

  return wrapperElement;
}