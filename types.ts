
export type Flags<T extends readonly string[]> = {
  [K in T[number]]?: boolean;
};
export type Arrays<T extends readonly string[]> = {
  [K in T[number]]?: string[];
};

export type FlexMode = "row" | "col";
export type Horizontal = "left" | "right" | "center"
export type Vertical = "top" | "bottom" | "middle" | "stretch";
export type Spacing = "even" | "between" | "around";

export const FLEX_KEYS = ['mode', 'side', 'vertical', 'spacing', 'wrap', 'reverse', 'baseline', 'gap', 'pad'] as const;
export type FlexProps = {
  mode?: FlexMode;
  horizontal?: Horizontal;
  vertical?: Vertical;
  spacing?: Spacing;
  wrap?: boolean;
  reverse?: boolean;
  baseline?: boolean;
  gap?: number | boolean;
  pad?: number | boolean;
}
export const flexProps: FlexProps = {};

export const THEME_KEYS = ['primary', 'secondary', 'accent', 'muted', 'background'] as const;
export type ThemeFlags = Flags<typeof THEME_KEYS>;

export type StyleProps = ThemeFlags & FlexProps;

export const BASE_KEYS = ['id', 'initial', 'trueState', 'falseState', 'debug'] as const;
export type BaseProps = { id?: string, initial?: boolean, trueState?: string, falseState?: string, debug?: boolean };

export const STATE_KEYS = ['show', 'activate', 'collapse', 'slide', 'bool'] as const;
export type StateTypeFlags = Flags<typeof STATE_KEYS>;

export const STATE_DEFAULT = ['true', 'false'];
export const STATE_MAP: Arrays<typeof STATE_KEYS> = {
  activate: ['active', 'inactive'],
  collapse: ['open',   'closed'],
  show:     ['show',   'hide'],
  slide:    ['in',     'out'],
  bool:    STATE_DEFAULT,
};

export const CONTAINER_KEYS = ['row', 'col', 'fit'] as const;
export type ContainerProps = StateTypeFlags & StyleProps & Flags<typeof CONTAINER_KEYS>;

export const BUTTON_VARIANT_KEYS = ['hoverline', 'ghost', 'outline'] as const;
export type ButtonVariantProps = Flags<typeof BUTTON_VARIANT_KEYS> & StyleProps

export const RAIL_LAYOUT_KEYS = ['left', 'right'] as const;
export type RailLayoutFlags = Flags<typeof RAIL_LAYOUT_KEYS>;