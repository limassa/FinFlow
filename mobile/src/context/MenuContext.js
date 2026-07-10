import React, { createContext, useContext, useState, useCallback } from 'react';

const MenuContext = createContext({
  openMenu: () => {},
  closeMenu: () => {},
  menuVisible: false,
  navigationRef: { current: null },
});

export function MenuProvider({ children, navigationRef }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  return (
    <MenuContext.Provider value={{ openMenu, closeMenu, menuVisible, navigationRef }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}
