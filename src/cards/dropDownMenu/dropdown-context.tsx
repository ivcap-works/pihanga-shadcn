import React from "react";

/**
 * Context to communicate dropdown menu state to nested components (e.g., Button triggers).
 * This allows triggers to hide their tooltips when the dropdown is open.
 */
export const DropdownOpenContext = React.createContext<boolean>(false);

export const useDropdownOpen = () => React.useContext(DropdownOpenContext);
