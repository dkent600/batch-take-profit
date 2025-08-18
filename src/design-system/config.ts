/**
 * Design System Configuration
 * Toggle between default FAST and custom theming
 */

// Configuration flags
export const DESIGN_SYSTEM_CONFIG = {
  // Set to false to use pure FAST defaults
  useCustomTheming: true,

  // Set to false to disable custom utility classes
  useCustomUtilities: true,

  // Set to false to disable Tailwind-inspired overrides
  useTailwindInspiredStyles: true
} as const;

// Theme selection
export type ThemeMode = 'default' | 'custom' | 'forest';
export const currentTheme: ThemeMode = 'custom'; // Change this to 'default' to use pure FAST

/**
 * Easy toggle functions for runtime configuration changes
 */
export function enableCustomTheming(): void {
  (DESIGN_SYSTEM_CONFIG as any).useCustomTheming = true;
}

export function disableCustomTheming(): void {
  (DESIGN_SYSTEM_CONFIG as any).useCustomTheming = false;
}

export function enableCustomUtilities(): void {
  (DESIGN_SYSTEM_CONFIG as any).useCustomUtilities = true;
}

export function disableCustomUtilities(): void {
  (DESIGN_SYSTEM_CONFIG as any).useCustomUtilities = false;
}
