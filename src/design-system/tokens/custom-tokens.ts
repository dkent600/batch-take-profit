/**
 * Custom Design Tokens (Tailwind/DaisyUI inspired)
 * These override FAST defaults with custom theming based on DaisyUI Forest theme
 */

import { DesignToken } from '@microsoft/fast-foundation';

// Custom color palette (based on DaisyUI Forest theme)
export const brandColor = DesignToken.create<string>('brand-color').withDefault('#1eb854');
export const accentColor = DesignToken.create<string>('accent-color').withDefault('#1fd65f');
export const neutralColor = DesignToken.create<string>('neutral-color').withDefault('#19362d');
export const baseColor = DesignToken.create<string>('base-color').withDefault('#171212');

// Background colors
export const backgroundColor = DesignToken.create<string>('background-color').withDefault('#171212');
export const surfaceColor = DesignToken.create<string>('surface-color').withDefault('#19362d');

// Text colors
export const primaryTextColor = DesignToken.create<string>('primary-text-color').withDefault('#ffffff');
export const secondaryTextColor = DesignToken.create<string>('secondary-text-color').withDefault('#a6adbb');

// State colors
export const successColor = DesignToken.create<string>('success-color').withDefault('#36d399');
export const warningColor = DesignToken.create<string>('warning-color').withDefault('#fbbd23');
export const errorColor = DesignToken.create<string>('error-color').withDefault('#f87272');
export const infoColor = DesignToken.create<string>('info-color').withDefault('#3abff8');

// Custom spacing scale (replacing Tailwind spacing)
export const spaceXs = DesignToken.create<string>('space-xs').withDefault('0.25rem'); // 4px
export const spaceSm = DesignToken.create<string>('space-sm').withDefault('0.5rem');  // 8px
export const spaceMd = DesignToken.create<string>('space-md').withDefault('1rem');    // 16px
export const spaceLg = DesignToken.create<string>('space-lg').withDefault('1.5rem');  // 24px
export const spaceXl = DesignToken.create<string>('space-xl').withDefault('2rem');    // 32px
export const space2xl = DesignToken.create<string>('space-2xl').withDefault('3rem');  // 48px

// Custom border radius
export const borderRadiusSm = DesignToken.create<string>('border-radius-sm').withDefault('0.25rem');
export const borderRadiusMd = DesignToken.create<string>('border-radius-md').withDefault('0.5rem');
export const borderRadiusLg = DesignToken.create<string>('border-radius-lg').withDefault('0.75rem');

// Custom typography
export const fontSizeSm = DesignToken.create<string>('font-size-sm').withDefault('0.875rem');
export const fontSizeBase = DesignToken.create<string>('font-size-base').withDefault('1rem');
export const fontSizeLg = DesignToken.create<string>('font-size-lg').withDefault('1.125rem');
export const fontSizeXl = DesignToken.create<string>('font-size-xl').withDefault('1.25rem');
export const fontSize2xl = DesignToken.create<string>('font-size-2xl').withDefault('1.5rem');

// Z-index layers
export const zIndexModal = DesignToken.create<number>('z-index-modal').withDefault(1000);
export const zIndexTooltip = DesignToken.create<number>('z-index-tooltip').withDefault(1010);
export const zIndexDropdown = DesignToken.create<number>('z-index-dropdown').withDefault(1020);

/**
 * Apply custom design tokens
 * This applies the DaisyUI Forest-inspired theme to FAST components
 */
export function applyCustomTokens(element: HTMLElement = document.body): void {
  // Apply color tokens
  brandColor.setValueFor(element, brandColor.default);
  accentColor.setValueFor(element, accentColor.default);
  neutralColor.setValueFor(element, neutralColor.default);
  baseColor.setValueFor(element, baseColor.default);

  backgroundColor.setValueFor(element, backgroundColor.default);
  surfaceColor.setValueFor(element, surfaceColor.default);

  primaryTextColor.setValueFor(element, primaryTextColor.default);
  secondaryTextColor.setValueFor(element, secondaryTextColor.default);

  successColor.setValueFor(element, successColor.default);
  warningColor.setValueFor(element, warningColor.default);
  errorColor.setValueFor(element, errorColor.default);
  infoColor.setValueFor(element, infoColor.default);

  // Apply spacing tokens
  spaceXs.setValueFor(element, spaceXs.default);
  spaceSm.setValueFor(element, spaceSm.default);
  spaceMd.setValueFor(element, spaceMd.default);
  spaceLg.setValueFor(element, spaceLg.default);
  spaceXl.setValueFor(element, spaceXl.default);
  space2xl.setValueFor(element, space2xl.default);

  // Apply other tokens
  borderRadiusSm.setValueFor(element, borderRadiusSm.default);
  borderRadiusMd.setValueFor(element, borderRadiusMd.default);
  borderRadiusLg.setValueFor(element, borderRadiusLg.default);

  fontSizeSm.setValueFor(element, fontSizeSm.default);
  fontSizeBase.setValueFor(element, fontSizeBase.default);
  fontSizeLg.setValueFor(element, fontSizeLg.default);
  fontSizeXl.setValueFor(element, fontSizeXl.default);
  fontSize2xl.setValueFor(element, fontSize2xl.default);

  zIndexModal.setValueFor(element, zIndexModal.default);
  zIndexTooltip.setValueFor(element, zIndexTooltip.default);
  zIndexDropdown.setValueFor(element, zIndexDropdown.default);
}

/**
 * Theme variants for different modes
 */
export const themes = {
  forest: {
    brand: '#1eb854',
    accent: '#1fd65f',
    neutral: '#19362d',
    base: '#171212',
    background: '#171212',
    surface: '#19362d',
    primaryText: '#ffffff',
    secondaryText: '#a6adbb'
  }
  // Add more themes as needed in the future
};
