import { Content } from ".";
import { cx, pluck } from "./utils";
import { useLocalIdState } from "./state.client";

export function MouseTrigger({id, children, ...props}: React.ComponentProps<typeof Content>) {
  const { setValue } = useLocalIdState();
  
  if(!id) {
    console.warn('PopupTrigger requires an id and ref');
    return null;
  }

  return (
    <Content {...props}
      onMouseEnter={() => setValue(id, true)}
      onMouseLeave={() => setValue(id, false)}
    >
      {children}
    </Content>
  );
}

export function Anchor({anchorId, children, ...props}: React.ComponentProps<typeof Content> & { anchorId: string }) {
  return (
    <Content style={{ anchorName: `--anchor-${anchorId}` }} {...props}>
      {children}
    </Content>
  );
}


export type AnchorPoint =
  | 'top-left'    | 'top-right'    | 'top-center'    | 'top'
  | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'bottom'
  | 'center-left' | 'center-right' | 'center-center' | 'center'
  | 'left'        | 'right';

type AxisV = 'top' | 'bottom' | 'center';
type AxisH = 'left' | 'right' | 'center';

function parseAnchorPoint(point: AnchorPoint): { vertical?: AxisV; horizontal?: AxisH } {
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

export function AnchorContent({anchorId, anchorPoint, targetPoint, children, className, ...props }: React.ComponentProps<typeof Content> 
  & { anchorId: string, anchorPoint: AnchorPoint, targetPoint: AnchorPoint }) {
  
  const anchorName = `--anchor-${anchorId}`;
  const ap = parseAnchorPoint(anchorPoint);
  const tp = parseAnchorPoint(targetPoint);

  // When targetPoint axis is 'center', use top/left + translateX/Y(-50%)
  const vertCSSProp  = tp.vertical   === 'center' ? 'top'  : tp.vertical;
  const horizCSSProp = tp.horizontal === 'center' ? 'left' : tp.horizontal;

  const translateX = tp.horizontal === 'center' ? 'translateX(-50%)' : '';
  const translateY = tp.vertical   === 'center' ? 'translateY(-50%)' : '';
  const transform  = [translateY, translateX].filter(Boolean).join(' ') || undefined;

  const dynamicStyle = {
    ...(vertCSSProp  && { [vertCSSProp]:  `anchor(${anchorName} ${ap.vertical  ?? 'center'})` }),
    ...(horizCSSProp && { [horizCSSProp]: `anchor(${anchorName} ${ap.horizontal ?? 'center'})` }),
    ...(transform    && { transform }),
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    positionAnchor: anchorName,
    ...dynamicStyle,
  };

  return (
    <Content show className={cx("anchor", className)} style={style} {...props}>
      {children}
    </Content>
  );
}
