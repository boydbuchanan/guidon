"use client"
import React from "react";
import { Text, Button, ChevronDown, SquareCheckIcon, SquareIcon, XIcon } from ".";

import { pluck } from "./utils";
import { createPortal } from "react-dom";
import { useLocalIdState } from "./state.client";
import { useKeyPress, usePortal } from "./hooks";
import { type BaseProps, BASE_KEYS } from "./types";

export function StateContent({
  as: Component = "div", // Default to div
  children,
  id,
  trueState = 'true',
  falseState = 'false',
  ...props
}: { as?: React.ElementType } & React.ComponentProps<"div"> & BaseProps) {
  const { isTrue } = useLocalIdState();
  const [flags, rest] = pluck(props, BASE_KEYS);
  return (
    <Component
      id={id}
      data-id={id}
      data-state={id ? (isTrue[id] ? trueState : falseState) : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
};

export function StateButton({
  children,
  id,
  trueState: trueValue = 'true',
  falseState: falseValue = 'false',
  onClick,
  ...props
}: React.ComponentProps<"button"> & BaseProps) {
  const { isTrue, setValue } = useLocalIdState();

  const [flags, rest] = pluck(props, BASE_KEYS);
  
  if(props.debug){
    console.log("StateButton props: ", flags, rest);
  }
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (id) setValue(id, !isTrue[id]);
    if(onClick) onClick(event);
  }

  return (
    <button
      id={id}
      onClick={handleClick}
      data-id={id}
      data-state={id ? (isTrue[id] ? trueValue : falseValue) : 'none'}
      {...rest}
    >
      {children}
    </button>
  );
}

export function CheckButton({children, ...props}: React.ComponentProps<typeof StateButton>) {
  const { isTrue } = useLocalIdState();
  const Icon = isTrue[props.id || ''] ? SquareCheckIcon : SquareIcon;

  return (
    <StateButton {...props}>
      {children || (
        <Icon />
      )}
    </StateButton>
  );
}

export function Backdrop({
  children,
  id,
  ...props
}: React.ComponentProps<"div"> & BaseProps) {
  const [base, rest] = pluck(props, BASE_KEYS);
  
  const { isTrue, setValue } = useLocalIdState();
  const isActive = id ? isTrue[id] : false;

  const handleClose = React.useCallback(() => {
    if (id) setValue(id, false);
  }, [id, setValue]);
  useKeyPress(handleClose, ['Escape', 'Esc'], isActive);
  
  if (!id || !isTrue[id]) return null;

  return (
    <div
      onClick={handleClose}
      className={`backdrop`}
      id={id}
      style={{ opacity: isTrue[id] ? 1 : 0, pointerEvents: isTrue[id] ? 'auto' : 'none' }}
      {...rest}
    />
  );
}

export function ThemeToggle() {
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const themeScheme = isDark ? 'light' : 'dark';

    html.setAttribute('data-theme', themeScheme);
    localStorage.setItem('theme', themeScheme);
  };
  // on mount, set theme based on localStorage or system preference
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved || pref);
  }, []);

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
      {/* Sun Icon */}
      <svg width="30" height="30" id="light-icon" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="6" fill="currentColor" />
        <line id="ray" stroke="currentColor" strokeWidth="2" strokeLinecap="round" x1="15" y1="1" x2="15" y2="4" />
        <use href="#ray" transform="rotate(45 15 15)" />
        <use href="#ray" transform="rotate(90 15 15)" />
        <use href="#ray" transform="rotate(135 15 15)" />
        <use href="#ray" transform="rotate(180 15 15)" />
        <use href="#ray" transform="rotate(225 15 15)" />
        <use href="#ray" transform="rotate(270 15 15)" />
        <use href="#ray" transform="rotate(315 15 15)" />
      </svg>

      {/* Moon Icon */}
      <svg width="30" height="30" id="dark-icon" viewBox="0 0 30 30">
        <path fill="currentColor" d="M 23, 5 A 12 12 0 1 0 23, 25 A 12 12 0 0 1 23, 5" />
      </svg>
    </button>
  );
}

export function ThemeInject(){
  return <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const saved = localStorage.getItem('theme');
            const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', saved || pref);
          })()
        ` }} />
}

export const Portal = ({ children, id }: React.PropsWithChildren & {id?: string}) => {
  const target = usePortal(id);

  if (!target) return null; // Wait for mount

  return createPortal(children, target);
};
