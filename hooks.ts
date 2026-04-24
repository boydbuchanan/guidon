import React from "react";

export function useOutsideClick<T extends HTMLElement>(callback: () => void, active = true) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!active) return;
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick, true);
    return () => document.removeEventListener('mousedown', handleClick, true);
  }, [callback, active]);

  return ref;
}

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
export function useTheme() {
  const [themeValue, setThemeValue] = React.useState(document.documentElement.dataset.theme || 'light');

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeValue(document.documentElement.dataset.theme || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return themeValue;
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number
  onCopy?: () => void
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = async (value: string) => {
    if (typeof window === "undefined" || !value) return false

    let hasCopied = false

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      hasCopied = true
    }

    if (!hasCopied) {
      return false
    }

    setIsCopied(true)
    onCopy?.()

    if (timeout !== 0) {
      setTimeout(() => {setIsCopied(false)}, timeout)
    }

    return true
  }

  return { isCopied, copyToClipboard }
}