/**
 * MS FAST Component Integration Utilities
 * 
 * This module provides utilities for integrating MS FAST components with Aurelia 2,
 * including type definitions and helper functions.
 */

import { IContainer } from 'aurelia';
import { DesignToken } from '@microsoft/fast-foundation';

/**
 * FAST component configuration for Aurelia integration
 */
export interface FASTComponentConfig {
  /**
   * Whether to use shadow DOM for FAST components
   */
  useShadowDOM?: boolean;

  /**
   * Custom prefix for FAST component tags
   */
  tagPrefix?: string;

  /**
   * Design token overrides
   */
  tokenOverrides?: Record<string, any>;
}

/**
 * Utility class for managing FAST components in Aurelia
 */
export class FASTIntegration {
  private container: IContainer;
  private config: FASTComponentConfig;

  constructor(container: IContainer, config: FASTComponentConfig = {}) {
    this.container = container;
    this.config = {
      useShadowDOM: true,
      tagPrefix: 'fast',
      ...config
    };
  }

  /**
   * Configure design tokens for a specific element
   */
  configureTokens(element: HTMLElement, tokens: Record<string, any>): void {
    Object.entries(tokens).forEach(([tokenName, value]) => {
      const token = DesignToken.create(tokenName);
      token.setValueFor(element, value);
    });
  }

  /**
   * Check if FAST components are properly registered
   */
  isRegistered(): boolean {
    return customElements.get('fast-button') !== undefined;
  }

  /**
   * Get configuration
   */
  getConfig(): FASTComponentConfig {
    return { ...this.config };
  }
}

/**
 * Type definitions for common FAST components used in templates
 */
export interface FASTButtonElement extends HTMLElement {
  appearance?: 'accent' | 'lightweight' | 'neutral' | 'outline' | 'stealth';
  disabled?: boolean;
  autofocus?: boolean;
}

export interface FASTTextFieldElement extends HTMLElement {
  appearance?: 'filled' | 'outline';
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  type?: 'email' | 'password' | 'tel' | 'text' | 'url';
}

export interface FASTCheckboxElement extends HTMLElement {
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  indeterminate?: boolean;
}

export interface FASTDialogElement extends HTMLElement {
  modal?: boolean;
  hidden?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface FASTTabsElement extends HTMLElement {
  orientation?: 'horizontal' | 'vertical';
  activeid?: string;
}

export interface FASTMenuElement extends HTMLElement {
  role?: string;
}

/**
 * Helper function to create FAST component with type safety
 */
export function createFASTElement<T extends HTMLElement>(
  tagName: string,
  properties?: Partial<T>
): T {
  const element = document.createElement(tagName) as T;

  if (properties) {
    Object.assign(element, properties);
  }

  return element;
}

/**
 * Utility to wait for FAST component to be defined
 */
export async function waitForComponent(tagName: string, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (customElements.get(tagName)) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`Component ${tagName} was not defined within ${timeout}ms`));
    }, timeout);

    customElements.whenDefined(tagName).then(() => {
      clearTimeout(timeoutId);
      resolve();
    });
  });
}

/**
 * Register multiple FAST components with error handling
 */
export async function ensureFASTComponents(componentNames: string[]): Promise<void> {
  const promises = componentNames.map(name => waitForComponent(name));

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to load FAST components:', error);
    throw error;
  }
}
