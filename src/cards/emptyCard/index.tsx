import * as React from "react";

import {
  createCardDeclaration,
  registerCardComponent,
  type PiCardProps,
} from "@pihanga2/core";

const CARD_NAME = "empty-card";
export const EmptyCard = createCardDeclaration<EmptyProps>(CARD_NAME);

export type EmptyProps = {
  style?: React.CSSProperties;
};

const DEF_STYLE = {
  height: "100%",
  backgroundColor: "var(--border)",
};

export const EmptyComponent = (
  props: PiCardProps<EmptyProps>,
): React.ReactNode => {
  const style = props.style || DEF_STYLE;
  return <div style={style} data-pihanga={props.cardName} />;
};

registerCardComponent({
  name: CARD_NAME,
  component: EmptyComponent,
});
