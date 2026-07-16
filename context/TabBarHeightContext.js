import React, { createContext, useContext } from 'react';
export const TabBarHeightContext = createContext(0);
export function useTabBarBottomInset() {
  return useContext(TabBarHeightContext);
}