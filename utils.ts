import { FLEX_KEYS, THEME_KEYS, type Flags, type FlexProps, type ThemeFlags } from "./types";


export function cx(...args: (string | undefined | boolean)[]) {
  return args.filter(Boolean).join(' ');
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
  let remaining = { ...props };
  
  // 1. Pluck Component-Specific Keys (e.g., BUTTON_KEYS)
  const [flags, r1] = pluck(remaining, extraKeys || []);
  
  // 2. Pluck Base Framework Keys (Constant lists)
  const [theme, r2] = pluck(r1, THEME_KEYS);
  const [flex, rest] = pluck(r2, FLEX_KEYS);

  return {
    flags: flags as Flags<K>,
    theme: theme as ThemeFlags,
    flex: flex as FlexProps,
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
    themeClasses(splitProps.theme),
    flexClasses(splitProps.flex),
  );
}

export function flexClasses(options?: FlexProps): string {
  if (!options) return "row";
  const gapStyle = options.gap ? ( options.gap === true ? "gap" : `gap-${options.gap}`) : undefined;
  const padStyle = options.pad ? ( options.pad === true ? "pad" : `pad-${options.pad}`) : undefined;
  return cx(
    options.mode || "row",
    options.horizontal,
    options.vertical,
    options.spacing,
    options.wrap === true && "wrap",
    options.wrap === false && "nowrap",
    options.reverse && "reverse",
    options.baseline && "baseline",
    gapStyle,
    padStyle
  );
}
export function themeClasses(options?: ThemeFlags): string | undefined {
  return flagClass(options || {}, THEME_KEYS);
}
