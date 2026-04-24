import { Content } from ".";
import { cx, pluck } from "./utils";
import { useLocalIdState } from "./state.client";
import React from "react";
import { useKeyPress, useOutsideClick } from "./hooks";
import type { AnchorPoint } from "./types";


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
export function CloseContent({id, children, ...props}: React.ComponentProps<typeof Content>) {
  const { isTrue, setValue } = useLocalIdState();
  const isActive = !!(id && isTrue[id]);
  if(!id) {
    console.warn('ClickAway requires an id');
    return null;
  }
  const handleClose = React.useCallback(() => {
      if (id) setValue(id, false);
    }, [id, setValue]);

  const ref = useOutsideClick<HTMLDivElement>(handleClose, isActive);
  useKeyPress(handleClose, ['Escape', 'Esc'], isActive);

  return (
    <Content ref={ref} id={id} {...props}>
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

type AxisV = 'top' | 'bottom' | 'center' | 'auto';
type AxisH = 'left' | 'right' | 'center' | 'auto';

function toPositionArea(point: AnchorPoint): string {
  return point.replace('-', ' ');  // 'bottom-center' → 'bottom center', 'bottom' stays 'bottom'
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

export function AnchorContent({anchorTo, anchorPoint, targetPoint, children, className, ...props }: React.ComponentProps<typeof Content> 
  & { anchorTo: string, anchorPoint?: AnchorPoint, targetPoint?: AnchorPoint }) {
  const style = getAnchorStyle(anchorTo, anchorPoint, targetPoint);

  return (
    <Content show className={cx("anchor", className)} style={style} {...props}>
      {children}
    </Content>
  );
}

export function getAnchorStyle(anchorTo: string, anchorPoint?: AnchorPoint, targetPoint?: AnchorPoint): React.CSSProperties {
  
  const anchorName = `--anchor-${anchorTo}`;
  const isManual = anchorPoint && targetPoint;
  const isPartial = anchorPoint && !targetPoint;

  let style: React.CSSProperties;
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
