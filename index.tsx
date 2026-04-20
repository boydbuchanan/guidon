import { Backdrop, Portal, StateButton, StateContent } from "./index.client";
import { BASE_KEYS, BUTTON_VARIANT_KEYS, CONTAINER_KEYS, STATE_DEFAULT, STATE_KEYS, STATE_MAP, type BaseProps, type ButtonVariantProps, type ContainerProps, type Flags, type RailLayoutFlags, type StyleProps } from "./types";
import { pluck, split, toClassNames, cx, flagClass } from "./utils";

/**
 * Container component for layout.
 * Renders a div by default, but can render any component specified by the 'as' prop.
 * Supports flex layout with 'row' and 'col' props, as well as a 'fit' prop to make the container take the full size of its parent.
 * Matches .container css class; by default, has padding.
 */
export function Container({
  as: Component = "div", // Default to div
  className = 'container',
  row,
  col,
  fit,
  ...props
}: React.ComponentProps<typeof StateContent> & ContainerProps) {
  const [, base] = pluck(props, STATE_KEYS);
  const { flags, rest, flex, theme } = split(base, CONTAINER_KEYS);
  if(props.debug)
    console.log("Container props: ", { flags, flex, theme });

  if(col || row) {
    if(col) flex.mode = 'col';
    else if(row) flex.mode = 'row';
  }
  
  const baseClasses = toClassNames({ flags, rest, flex, theme });
  if(props.debug)
    console.log("Base Classes: ", baseClasses);

  const otherClasses = cx(fit && 'fit', className);

  if(props.id){
    
    var stateType = STATE_KEYS.find(type => props[type] === true);
    const [on, off] = stateType && STATE_MAP[stateType] || STATE_DEFAULT;

    return <StateContent trueState={on} falseState={off} {...rest} className={cx(baseClasses, otherClasses, stateType)} />
  }
  return <Component className={cx(baseClasses, otherClasses)} {...rest} />
};

/**
 * Text component for typography. Renders a span by default, but can render any component specified by the 'as' prop.
 * Should be used with h1-h6, p, or other text elements to ensure semantic HTML.
 * Matches .text css class.
 */
export function Text({as = "span",className,...props}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  const Component = (as) as React.ElementType;
  return <Component className={cx('text', className)} {...props} />
}

export interface SvgIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  pathProps?: React.ComponentPropsWithoutRef<'path'>;
  d?: string;
  size?: string | number;
}

export function SvgIcon({
  children,
  fill = 'currentColor',
  viewBox = '0 0 24 24',
  height = '2em',
  width = '2em',
  size,
  pathProps,
  d,
  ...svgProps
}: SvgIconProps) {
  if(size){
    height = size;
    width = size;
  }
  return (
    <svg
      {...svgProps}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      width={width}
      height={height}
      viewBox={viewBox}
    >
      {d ? <path d={d} {...pathProps} /> : null}
      {children}
    </svg>
  );
}

/**
 * Button component for actions. Renders a button element with various styling options based on props.
 * Supports variants like 'ghost', 'outline', 'light', 'dark', and 'link' through boolean props.
 * Also supports theme and flex styling through the base utility props.
 * Matches .button css class, with additional classes based on variants and state.
 */
export function Button({
  className,
  ...props
}: React.ComponentProps<"button"> & ButtonVariantProps) {
  // Split out button-specific keys + base framework keys
  const { flags, rest, ...base } = split(props, BUTTON_VARIANT_KEYS);
  
  // 'extra' contains ghost, outline, etc.
  const buttonVariant = flagClass(flags, BUTTON_VARIANT_KEYS);
  
  // 'base' contains the theme, flex, and style objects for the master utility
  const baseClasses = toClassNames({ flags, rest, ...base });

  return (
    <button className={cx('button', buttonVariant, baseClasses, className)} {...rest} />
  );
}

/**
 * Group component for layout grouping. Renders a flex container with optional row or column layout.
 * @param {boolean} row - If true, renders a row layout. Defaults to true.
 * @param {boolean} col - If true, renders a column layout. Defaults to false.
 */
export function Group({
  className,
  row,
  col,
  ...props
}: React.ComponentProps<typeof Container>) {
  return (
    <Container className={cx('joined borders', className)} row={col ? false : true} col={col ? true : false} {...props}/>
  )
}
/**
 * RadioGroup component for layout grouping. Renders a flex container with optional row or column layout, and applies radio button styling.
 * @param {boolean} row - If true, renders a row layout. Defaults to true.
 * @param {boolean} col - If true, renders a column layout. Defaults to false.
 */
export function RadioGroup({
  className,
  row,
  col,
  ...props
}: React.ComponentProps<typeof Container>) {
  return (
    <Container className={cx('joined radio', className)} row={col ? false : true} col={col ? true : false} {...props}/>
  )
}
/**
 * Default Content component for layout. Renders a flex container with optional row or column layout.
 * For .content css class, by default not padded
 * @param {boolean} row - If true, renders a row layout. Defaults to true.
 * @param {boolean} col - If true, renders a column layout. Defaults to false.
 */
export function Content({
  row,
  col,
  className,
  ...props
}: React.ComponentProps<typeof Container>) {
  return <Container className={cx('content', className)} col={row ? false : true} row={row ? true : false} {...props}/>
};
/**
 * Default Content component for layout. Renders a flex container with column layout.
 * @returns {JSX.Element} A React component that renders a flex container with the specified layout and children.
 */
export function Col({
  className,
  ...props
}: React.ComponentProps<typeof Container>) {
  return <Container className={cx('content', className)} col row={false} {...props}/>
}
/**
 * Default Content component for layout. Renders a flex container with row layout.
 * @returns {JSX.Element} A React component that renders a flex container with the specified layout and children.
 */
export function Row({
  className,
  ...props
}: React.ComponentProps<typeof Container>) {
  return <Container className={cx('content', className)} row col={false} {...props}/>
};
export const PANEL_KEYS = ['left', 'right', 'top', 'bottom', 'center'] as const;
export type PanelFlags = Flags<typeof PANEL_KEYS>;
export type PanelProps = PanelFlags & BaseProps;

/**
 * Panel is a component for content that is anchored to a position on screen.
 */
export function Panel({
  children,
  className,
  as: Component = 'aside',
  ...props
}: PanelProps & React.ComponentProps<typeof Container>) {
  const [flags, rest] = pluck(props, PANEL_KEYS);
  var side = PANEL_KEYS.find(type => flags[type] === true);
  
  return (
    <Container 
      as={Component}
      className={cx(`panel`, className)}
      data-side={side}
      col
      {...rest}
      >
      {children}
    </Container>
  );
};
/**
 * Sheet is a panel that slides into screen with a backdrop.
 * A portal is used to create the panel outside of the normal DOM hierarchy, allowing it to overlay other content without being affected by parent styles or layout.
 */
export function Sheet({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function SheetPanel({className, ...props}: React.ComponentProps<typeof Panel>) {
  const [base] = pluck(props, BASE_KEYS);
  return (
    <Portal {...base}>
      <Backdrop {...base} />
      <Panel as='section' className={cx(`sheet`, className)} slide {...props}/>
    </Portal>
  );
};
/**
 * Modal is a panel that is centered on the screen with a backdrop. Rather than slide, it shows and hides.
 * A portal is used to create the panel outside of the normal DOM hierarchy, allowing it to overlay other content without being affected by parent styles or layout.
 */
export function Modal({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
export const ModalHeader = CloseHeader;
export const ModalButton = CloseButton;
export const SheetHeader = CloseHeader;
export const SheetButton = CloseButton;


export function ModalPanel({className, ...props}: PanelProps & React.ComponentProps<typeof Panel>) {
  return (
    <Portal {...props}>
      <Backdrop {...props} />
      <Panel as='section' className={cx(`modal`, className)} center show {...props}/>
    </Portal>
  );
};

export function Rail({
  children,
  left,
  right,
  ...props
}: React.ComponentProps<"div"> & {left?: boolean, right?: boolean} ) {
  const side = left ? 'left' : right ? 'right' : undefined;
  return (
    <nav className={`rail ${side}`} data-side={side} {...props}>
      <div className={`buttons center`}>
        {children}
      </div>
    </nav>
  );
}

export function RailButton({...props}: React.ComponentProps<typeof StateButton>) {
  return <StateButton trueState='active' falseState='inactive' {...props}/>
}

export function RailLayoutWrapper({ id = 'rail-root', className, children, left, right, ...props }: { children: React.ReactNode } & React.ComponentProps<"div"> & RailLayoutFlags & BaseProps) {
  
  var layoutClass = `${left ? 'rail-left' : ''} ${right ? 'rail-right' : ''}`;

  return (
    <div id={'rail-root'} className={cx(layoutClass, className)} {...props}>
      {children}
    </div>
  );
}

export function RailItem({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function RailContent({
  children,
  className,
  label,
  ...props
}: React.ComponentProps<typeof Panel> & { label: string } & BaseProps) {
  const [ base ] = pluck(props, BASE_KEYS);
  

  return (
    <Portal id={'rail-root'}>
      <Panel slide {...props}>
        <CloseHeader {...base}>
          {label}
        </CloseHeader>
        <Content>
          {children}
        </Content>
      </Panel>
    </Portal>
  );
};

export function ActiveButton({...props}: React.ComponentProps<typeof StateButton>) {
  return <StateButton trueState='active' falseState='inactive' {...props}/>
}

export function OpenButton({...props}: React.ComponentProps<typeof StateButton>) {
  return <StateButton trueState='open' falseState='closed' {...props}/>
}

export function ShowButton({...props}: React.ComponentProps<typeof StateButton>) {
  return <StateButton trueState='show' falseState='hide' {...props}/>
}

export function ChevronButton({
  children,
  ...props
}: React.ComponentProps<typeof StateButton>) {
  return (
    <StateButton
      trueState='open'
      falseState='closed'
      {...props}
    >
      {children}
      <ChevronDown className='open-rotate' size={16} />
    </StateButton>
  );
}

export function CloseHeader({
  children,
  ...props
}: React.ComponentProps<"header"> & BaseProps) {
  const [base, rest] = pluck(props, BASE_KEYS);
  return (
    <header {...rest}>
      <Text as='h6' className={`semibold`}>{children}</Text>
      <CloseButton {...base} />
    </header>
  );
};

export function CloseButton({
  children,
  ...props
}: React.ComponentProps<typeof Button> & BaseProps) {
  return (
    <StateButton {...props}>
      {children || (
        <XIcon />
      )}
    </StateButton>
  );
}

export function ActiveContent({trueState, falseState, ...props}: React.ComponentProps<typeof StateContent>) {
  return <StateContent trueState='active' falseState='inactive' {...props}/>
}

export function OpenContent({trueState, falseState, ...props}: React.ComponentProps<typeof StateContent>) {
  return <StateContent trueState='open' falseState='closed' {...props}/>
}

export function ShowContent({trueState, falseState, ...props}: React.ComponentProps<typeof StateContent>) {
  return <StateContent trueState='show' falseState='hide' {...props}/>
}

export function SlideContent({trueState, falseState, ...props}: React.ComponentProps<typeof StateContent>) {
  return <StateContent trueState='in' falseState='out' {...props}/>
}

export function ChevronDown({ ...props }: SvgIconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props} >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </SvgIcon>
  )
}
export function XIcon({ ...props }: SvgIconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props} >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </SvgIcon>
  )
}

export function CheckIcon({ ...props }: SvgIconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props} >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </SvgIcon>
  )
}
export function SquareIcon({ ...props }: SvgIconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props} >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </SvgIcon>
  )
}
export function SquareCheckIcon({ ...props }: SvgIconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props} >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
    </SvgIcon>
  )
}
import { LocalProvider, RadioProvider, SelectionProvider, type MinMax } from "./state.client";

export function LocalState({
  items,
  children
}: { items?: BaseProps[], children: React.ReactNode }) {
  const initialState: Record<string, boolean> = {};
  if(items) {
    items.forEach(item => {
      if(item.id) initialState[item.id] = item.initial || false;
    });
  }
  return (
    <LocalProvider initialState={initialState}>
      {children}
    </LocalProvider>
  )
}

export function RadioState({
  items,
  children,
}: { items?: BaseProps[], children: React.ReactNode }) {
  const initialState: Record<string, boolean> = {};
  if(items) {
    items.forEach(item => {
      if(item.id) initialState[item.id] = item.initial || false;
    });
  }

  return (
    <RadioProvider initialState={initialState}>
      {children}
    </RadioProvider>
  )
}
export function SelectionState({
  items,
  min,
  max,
  replace,
  children,
}: { items?: BaseProps[], children: React.ReactNode } & MinMax) {
  const initialState: Record<string, boolean> = {};
  if(items) {
    items.forEach(item => {
      if(item.id) initialState[item.id] = item.initial || false;
    });
  }

  return (
    <SelectionProvider initialState={initialState} min={min} max={max} replace={replace}>
      {children}
    </SelectionProvider>
  )
}