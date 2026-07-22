import { FLEX_KEYS, THEME_KEYS } from "./types";
import type { AnchorPoint, BaseProps, Flags, FlexProps, ThemeFlags } from "./types";
import type { CSSProperties } from "react";

export function cx(...args: (string | undefined | boolean | null)[]): string {
  const classes = new Set<string>();

  args.forEach((arg) => {
    // Only process truthy strings
    if (typeof arg === 'string' && arg.trim()) {
      // Split by any whitespace (handles multiple spaces or newlines)
      arg.split(/\s+/).forEach((cls) => {
        if (cls) classes.add(cls);
      });
    }
  });

  return Array.from(classes).join(' ');
}

export function pluck<T extends object, K extends readonly string[]>(
  props: T, 
  keys: K
) {
  if(!props) return [{}, {}] as const;
  if(!keys || keys.length === 0) return [{}, props] as const;
  const picked: any = {};
  const remaining = { ...props };

  keys.forEach((key) => {
    if (key in remaining) {
      picked[key] = (remaining as any)[key];
      delete (remaining as any)[key];
    }
  });

  return [picked, remaining] as const;
}
/**
 * Splits props into categorized groups based on provided keys and constant key lists.
 * Includes theme flex and state keys.
 * @param props Properties
 * @param extraKeys Pass anything that isn't THEME_KEYS, FLEX_KEYS, or BASE_KEYS.
 * @returns An object containing categorized props: flags, theme, flex, state, and rest.
 */
export function split<T extends Record<string, any>, K extends readonly string[]>(
  props: T, 
  extraKeys?: K
) {
  const remaining = { ...props };
  
  // 1. Pluck Component-Specific Keys (e.g., BUTTON_KEYS)
  const [flags, r1] = pluck(remaining, extraKeys || []);
  
  // 2. Pluck Base Framework Keys (Constant lists)
  const [theme, r2] = pluck(r1, THEME_KEYS);
  const [flex, rest] = pluck(r2, FLEX_KEYS);

  return {
    flags: flags as Flags<K>,
    theme: theme as ThemeFlags,
    flex: flex as FlexProps,
    base: rest as BaseProps,
    rest
  };
}
export function flagClass<T extends Record<string, any>>(
  options: T, 
  keys: readonly string[],
  all?: boolean
): string | undefined {
  if(!options) return undefined;
  if(all) {
    // If all is true, return all keys that are true in options
    const activeKeys = keys.filter(key => options[key] === true);
    return cx(...activeKeys);
  }
  // Find the first key in the priority list that is strictly true
  const active = keys.find(key => options[key] === true);
  return active || undefined;
}

export function toClassNames(splitProps: ReturnType<typeof split>) {
  return cx(
    flagsToString(splitProps.flags),
    themeClasses(splitProps.theme),
    flexClasses(splitProps.flex),
  );
}

/**
 * Converts a Flags object into a space-separated string of active keys.
 */
export function flagsToString<T extends readonly string[]>(flags: Flags<T>): string {
  return Object.entries(flags)
    .filter(([_, value]) => Boolean(value)) // Ensure truthy values only
    .map(([key]) => key)
    .join(' ');
}

export function flexClasses(options?: FlexProps): string {
  if (!options) return "row";
  const gapStyle = options.gap ? ( options.gap === true ? "gap" : `gap-${options.gap}`) : undefined;
  const padStyle = options.pad ? ( options.pad === true ? "pad" : `pad-${options.pad}`) : undefined;
  const basisStyle = options.basis ? ( options.basis === true ? "basis-1" : `basis-${options.basis}`) : undefined;
  const widthStyle = options.width ? ( options.width === true ? "full-width" : `width-${options.width}`) : undefined;

  return cx(
    options.mode || "",
    options.horizontal,
    options.vertical,
    options.spacing,
    options.wrap === true && "wrap",
    options.wrap === false && "nowrap",
    options.reverse && "reverse",
    options.baseline && "baseline",
    gapStyle,
    padStyle,
    basisStyle,
    widthStyle
  );
}
export function themeClasses(options?: ThemeFlags): string | undefined {
  return flagClass(options || {}, THEME_KEYS);
}

type AxisV = 'top' | 'bottom' | 'center' | 'auto';
type AxisH = 'left' | 'right' | 'center' | 'auto';

function toPositionArea(point: AnchorPoint): string {
  return point.replace('-', ' ');  // 'bottom-center' → 'bottom center', 'bottom' stays 'bottom'
}
/**
 * Scrolls so `target`'s top lands just below the sticky header, measuring
 * the header's real height at call time since it grows/wraps (`height: auto`)
 * rather than assuming a fixed size.
 */
export function scrollToTarget(target: Element, offset = 0) {
  const header = document.querySelector('header.sticky');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
}
function parseAnchorPoint(point?: AnchorPoint): { vertical?: AxisV; horizontal?: AxisH } {
  if (!point) return {vertical: 'auto', horizontal: 'auto'};
  const parts = point.split('-');

  // bare 'center' means center on both axes
  if (parts.length === 1 && parts[0] === 'center') {
    return { vertical: 'center', horizontal: 'center' };
  }

  let vertical: AxisV | undefined;
  let horizontal: AxisH | undefined;

  for (const part of parts) {
    if (part === 'top' || part === 'bottom') vertical = part;
    else if (part === 'left' || part === 'right') horizontal = part;
    else if (part === 'center') {
      // assign to first unset axis (order: vertical first)
      if (vertical === undefined) vertical = 'center';
      else horizontal = 'center';
    }
  }

  return { vertical, horizontal };
}

export function getAnchorStyle(anchorTo: string, anchorPoint?: AnchorPoint, targetPoint?: AnchorPoint): CSSProperties {

  const anchorName = `--anchor-${anchorTo}`;
  const isManual = anchorPoint && targetPoint;
  const isPartial = anchorPoint && !targetPoint;

  let style: CSSProperties;
  if (isManual) {
    // Existing anchor() logic — explicit both axes
    const ap = parseAnchorPoint(anchorPoint);
    const tp = parseAnchorPoint(targetPoint);
    const vertCSSProp  = tp.vertical   === 'center' ? 'top'  : tp.vertical;
    const horizCSSProp = tp.horizontal === 'center' ? 'left' : tp.horizontal;
    const translateX = tp.horizontal === 'center' ? 'translateX(-50%)' : '';
    const translateY = tp.vertical   === 'center' ? 'translateY(-50%)' : '';
    const transform  = [translateY, translateX].filter(Boolean).join(' ') || undefined;
    style = {
      position: 'fixed',
      positionAnchor: anchorName,
      ...(vertCSSProp  && { [vertCSSProp]:  `anchor(${ap.vertical  ?? 'center'})` }),
      ...(horizCSSProp && { [horizCSSProp]: `anchor(${ap.horizontal ?? 'center'})` }),
      ...(transform    && { transform }),
    };
  } else {
    // Auto or partial — use position-area, browser handles overflow
    style = {
      position: 'fixed',
      positionAnchor: anchorName,
      positionArea: isPartial ? toPositionArea(anchorPoint) : 'block-end center',
      positionTryFallbacks: 'flip-block, flip-inline, flip-start',
      positionTryOrder: 'most-block-size',
    };
  }

  return style;
}
