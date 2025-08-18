/**
 * Design System Entry Point
 * Orchestrates the loading of default vs custom design tokens and styles
 */

import { DESIGN_SYSTEM_CONFIG, currentTheme, type ThemeMode } from './config.js';
import { applyDefaultTokens, resetToDefaults } from './tokens/default-tokens.js';
import { applyCustomTokens } from './tokens/custom-tokens.js';

// Track loaded styles to avoid duplicates
let stylesLoaded = false;
let currentStyleMode: 'default' | 'custom' | null = null;

/**
 * Initialize the design system based on configuration
 */
export async function initializeDesignSystem(element: HTMLElement = document.body): Promise<void> {
  console.log('🎨 Initializing Design System...');
  console.log('📋 Configuration:', DESIGN_SYSTEM_CONFIG);
  console.log('🎭 Current Theme:', currentTheme);

  // Always apply FAST foundation first
  applyDefaultTokens(element);

  // Conditionally apply custom theming
  if (DESIGN_SYSTEM_CONFIG.useCustomTheming && currentTheme === 'custom') {
    console.log('✨ Applying custom theming...');
    applyCustomTokens(element);
    await loadCustomStyles();
  } else {
    console.log('🔧 Using default FAST styling...');
    resetToDefaults(element);
    await loadDefaultStyles();
  }

  console.log('✅ Design System initialized successfully!');
}

/**
 * Load default FAST styles
 */
async function loadDefaultStyles(): Promise<void> {
  if (currentStyleMode === 'default') return;

  try {
    // Import default styles
    await import('./styles/fast-default.css');
    currentStyleMode = 'default';
    console.log('📄 Default FAST styles loaded');
  } catch (error) {
    console.error('❌ Failed to load default styles:', error);
  }
}

/**
 * Load custom styles (Tailwind/DaisyUI inspired)
 */
async function loadCustomStyles(): Promise<void> {
  if (currentStyleMode === 'custom') return;

  try {
    // Import custom styles
    await import('./styles/fast-custom.css');
    currentStyleMode = 'custom';
    console.log('🎨 Custom styles loaded');
  } catch (error) {
    console.error('❌ Failed to load custom styles:', error);
  }
}

/**
 * Switch theme at runtime
 */
export async function switchTheme(theme: ThemeMode, element: HTMLElement = document.body): Promise<void> {
  console.log(`🔄 Switching theme to: ${theme}`);

  if (theme === 'default') {
    // Remove custom tokens and apply defaults
    resetToDefaults(element);
    await loadDefaultStyles();
  } else if (theme === 'custom') {
    // Apply custom tokens
    applyDefaultTokens(element);
    applyCustomTokens(element);
    await loadCustomStyles();
  }

  console.log(`✅ Theme switched to: ${theme}`);
}

/**
 * Enable custom theming at runtime
 */
export async function enableCustomTheming(element: HTMLElement = document.body): Promise<void> {
  console.log('🎨 Enabling custom theming...');
  (DESIGN_SYSTEM_CONFIG as any).useCustomTheming = true;
  await switchTheme('custom', element);
}

/**
 * Disable custom theming at runtime (revert to FAST defaults)
 */
export async function disableCustomTheming(element: HTMLElement = document.body): Promise<void> {
  console.log('🔧 Disabling custom theming (reverting to FAST defaults)...');
  (DESIGN_SYSTEM_CONFIG as any).useCustomTheming = false;
  await switchTheme('default', element);
}

/**
 * Get current design system status
 */
export function getDesignSystemStatus() {
  return {
    config: DESIGN_SYSTEM_CONFIG,
    currentTheme,
    currentStyleMode,
    stylesLoaded
  };
}

// Re-export configuration and utilities for external access
export { DESIGN_SYSTEM_CONFIG, currentTheme } from './config.js';
export type { ThemeMode } from './config.js';
