import React from "react";

type G = {
  name2icon: {[name: string]: React.ElementType};
};

declare global {
  interface Window {
    _PihangaIcons: G;
  }
}

window._PihangaIcons = window._PihangaIcons || {
  name2icon: {},
};

const name2icon = window._PihangaIcons.name2icon;



export function registerIcon(name: string, el: React.ElementType): string {
  if (name2icon[name] !== undefined) {
    throw new Error(`icon '${name}' already registered`);
  }
  name2icon[name] = el;
  return name;
}

export function getIconElement(name: string): React.ElementType | undefined {
  return name2icon[name];
}

// can't figure out what the proper return type is, SVvgIconT does
// NOT work with <IconButton>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIcon(name: string, props?: any): React.ReactNode {
  const icon = name2icon[name];
  if (!icon) return null;
  const el = React.createElement(icon, props);
  return el;
}
