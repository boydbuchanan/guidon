import { Content } from ".";
import { cx, getAnchorStyle } from "./utils";
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

export function AnchorContent({anchorTo, anchorPoint, targetPoint, children, className, ...props }: React.ComponentProps<typeof Content> 
  & { anchorTo: string, anchorPoint?: AnchorPoint, targetPoint?: AnchorPoint }) {
  const style = getAnchorStyle(anchorTo, anchorPoint, targetPoint);

  return (
    <Content show className={cx("anchor", className)} style={style} {...props}>
      {children}
    </Content>
  );
}