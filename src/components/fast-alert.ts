/**
 * Custom FAST Alert Component
 * Replaces DaisyUI alert components with FAST-styled alternatives
 */

import { FASTElement, customElement, attr, html, css, observable } from '@microsoft/fast-element';

const alertTemplate = html<FastAlert>`
  <div class="alert-container" part="container">
    <div class="alert-icon" part="icon" ?hidden="${x => !x.icon}">
      ${x => x.icon}
    </div>
    <div class="alert-content" part="content">
      <slot></slot>
    </div>
  </div>
`;

const alertStyles = css`
  :host {
    display: block;
    padding: var(--space-md, 1rem);
    border-radius: var(--border-radius-md, 0.5rem);
    margin: var(--space-sm, 0.5rem) 0;
    border: 1px solid;
    font-size: var(--font-size-sm, 0.875rem);
  }

  .alert-container {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 0.5rem);
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: var(--font-size-lg, 1.125rem);
  }

  .alert-content {
    flex: 1;
  }

  /* Error variant */
  :host([variant="error"]) {
    background-color: var(--error-color, #f87272);
    border-color: var(--error-color, #f87272);
    color: var(--primary-text-color, #ffffff);
  }

  /* Warning variant */
  :host([variant="warning"]) {
    background-color: var(--warning-color, #fbbd23);
    border-color: var(--warning-color, #fbbd23);
    color: var(--base-color, #171212);
  }

  /* Info variant */
  :host([variant="info"]) {
    background-color: var(--info-color, #3abff8);
    border-color: var(--info-color, #3abff8);
    color: var(--base-color, #171212);
  }

  /* Success variant */
  :host([variant="success"]) {
    background-color: var(--success-color, #36d399);
    border-color: var(--success-color, #36d399);
    color: var(--base-color, #171212);
  }
`;

@customElement({
  name: 'fast-alert',
  template: alertTemplate,
  styles: alertStyles
})
export class FastAlert extends FASTElement {
  @attr
  variant: 'error' | 'warning' | 'info' | 'success' = 'info';

  @attr
  icon?: string;
}
