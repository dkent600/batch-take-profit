/**
 * Theme Switcher Utility
 * 
 * This module provides easy functions to switch between design systems
 * for testing and development purposes.
 */

import {
  enableCustomTheming,
  disableCustomTheming,
  switchTheme,
  getDesignSystemStatus,
  type ThemeMode
} from './design-system/index.js';

/**
 * Global theme switcher functions for browser console testing
 */
declare global {
  interface Window {
    switchToDefaultFAST: () => Promise<void>;
    switchToCustomTheme: () => Promise<void>;
    toggleTheme: () => Promise<void>;
    getThemeStatus: () => any;
  }
}

let currentMode: ThemeMode = 'custom';

/**
 * Switch to default FAST styling (removes all customizations)
 */
export async function switchToDefaultFAST(): Promise<void> {
  console.log('🔧 Switching to default FAST...');
  await disableCustomTheming();
  currentMode = 'default';
  console.log('✅ Now using pure MS FAST defaults');
}

/**
 * Switch to custom theming (DaisyUI Forest inspired)
 */
export async function switchToCustomTheme(): Promise<void> {
  console.log('🎨 Switching to custom theme...');
  await enableCustomTheming();
  currentMode = 'custom';
  console.log('✅ Now using custom DaisyUI-inspired theming');
}

/**
 * Toggle between default and custom themes
 */
export async function toggleTheme(): Promise<void> {
  if (currentMode === 'default') {
    await switchToCustomTheme();
  } else {
    await switchToDefaultFAST();
  }
}

/**
 * Get current theme status
 */
export function getThemeStatus() {
  return {
    currentMode,
    designSystemStatus: getDesignSystemStatus()
  };
}

/**
 * Install theme switcher functions globally for console access
 */
export function installGlobalThemeSwitcher(): void {
  window.switchToDefaultFAST = switchToDefaultFAST;
  window.switchToCustomTheme = switchToCustomTheme;
  window.toggleTheme = toggleTheme;
  window.getThemeStatus = getThemeStatus;

  console.log('🎛️ Theme switcher installed globally!');
  console.log('📋 Available functions:');
  console.log('   - switchToDefaultFAST() - Use pure MS FAST defaults');
  console.log('   - switchToCustomTheme() - Use DaisyUI-inspired custom theme');
  console.log('   - toggleTheme() - Toggle between themes');
  console.log('   - getThemeStatus() - Get current theme information');
}
