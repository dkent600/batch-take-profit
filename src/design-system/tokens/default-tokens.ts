/**
 * Default MS FAST Design Tokens
 * These use FAST's built-in design system without customization
 */

import { DesignToken } from '@microsoft/fast-foundation';

// Core FAST tokens (minimal setup - FAST handles most defaults automatically)
export const designUnit = DesignToken.create<number>('design-unit').withDefault(4);
export const baseHeightMultiplier = DesignToken.create<number>('base-height-multiplier').withDefault(8);
export const density = DesignToken.create<number>('density').withDefault(0);

// Standard FAST color tokens (these will use FAST's default values)
export const accentBaseColor = DesignToken.create<string>('accent-base-color').withDefault('#005a9e');
export const neutralBaseColor = DesignToken.create<string>('neutral-base-color').withDefault('#808080');

/**
 * Apply default FAST design tokens
 * This sets up the minimal configuration for FAST components to work properly
 */
export function applyDefaultTokens(element: HTMLElement = document.body): void {
  // Apply core design tokens
  designUnit.setValueFor(element, designUnit.default);
  baseHeightMultiplier.setValueFor(element, baseHeightMultiplier.default);
  density.setValueFor(element, density.default);

  // Apply default colors (FAST will handle the rest)
  accentBaseColor.setValueFor(element, accentBaseColor.default);
  neutralBaseColor.setValueFor(element, neutralBaseColor.default);
}

/**
 * Reset to pure FAST defaults (removes any custom overrides)
 */
export function resetToDefaults(element: HTMLElement = document.body): void {
  // Remove any custom CSS properties that might interfere
  element.style.removeProperty('--brand-color');
  element.style.removeProperty('--accent-color');
  element.style.removeProperty('--background-color');
  element.style.removeProperty('--surface-color');
  element.style.removeProperty('--primary-text-color');
  element.style.removeProperty('--secondary-text-color');

  // Apply clean FAST defaults
  applyDefaultTokens(element);
}
