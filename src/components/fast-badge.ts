import { FASTElement, customElement, attr, html, css } from '@microsoft/fast-element';

const badgeTemplate = html<FastBadge>`
  <span class="fast-badge" part="badge">
    <slot></slot>
  </span>
`;

const badgeStyles = css`
  :host {
    display: inline-flex;
  }

  .fast-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--design-unit);
    font-size: calc(var(--type-ramp-minus-1-font-size) * 1px);
    font-weight: 600;
    line-height: 1;
    min-height: calc(var(--design-unit) * 6px);
    padding: calc(var(--design-unit) * 1px) calc(var(--design-unit) * 2px);
    text-align: center;
    white-space: nowrap;
  }

  /* Default variant (neutral) */
  :host {
    --badge-bg: var(--neutral-layer-2);
    --badge-color: var(--neutral-foreground-rest);
    --badge-border: var(--neutral-stroke-rest);
  }

  /* Primary variant */
  :host([variant="primary"]) {
    --badge-bg: var(--accent-fill-rest);
    --badge-color: var(--foreground-on-accent-rest);
    --badge-border: var(--accent-fill-rest);
  }

  /* Secondary variant */
  :host([variant="secondary"]) {
    --badge-bg: var(--neutral-layer-3);
    --badge-color: var(--neutral-foreground-rest);
    --badge-border: var(--neutral-stroke-rest);
  }

  /* Success variant */
  :host([variant="success"]) {
    --badge-bg: #10b981;
    --badge-color: white;
    --badge-border: #10b981;
  }

  /* Warning variant */
  :host([variant="warning"]) {
    --badge-bg: #f59e0b;
    --badge-color: white;
    --badge-border: #f59e0b;
  }

  /* Error variant */
  :host([variant="error"]) {
    --badge-bg: #ef4444;
    --badge-color: white;
    --badge-border: #ef4444;
  }

  /* Info variant */
  :host([variant="info"]) {
    --badge-bg: #3b82f6;
    --badge-color: white;
    --badge-border: #3b82f6;
  }

  .fast-badge {
    background: var(--badge-bg);
    color: var(--badge-color);
    border: 1px solid var(--badge-border);
  }

  /* Size variants */
  :host([size="small"]) .fast-badge {
    font-size: calc(var(--type-ramp-minus-2-font-size) * 1px);
    min-height: calc(var(--design-unit) * 4px);
    padding: calc(var(--design-unit) * 0.5px) calc(var(--design-unit) * 1.5px);
  }

  :host([size="large"]) .fast-badge {
    font-size: calc(var(--type-ramp-base-font-size) * 1px);
    min-height: calc(var(--design-unit) * 8px);
    padding: calc(var(--design-unit) * 1.5px) calc(var(--design-unit) * 3px);
  }

  /* Outline variants */
  :host([outline]) .fast-badge {
    background: transparent;
    color: var(--badge-border);
    border: 2px solid var(--badge-border);
  }

  /* Ghost variants */
  :host([ghost]) .fast-badge {
    background: transparent;
    color: var(--badge-bg);
    border: none;
  }
`;

@customElement({
  name: 'fast-badge',
  template: badgeTemplate,
  styles: badgeStyles
})
export class FastBadge extends FASTElement {
  @attr
  variant: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error' | 'info' = 'neutral';

  @attr({ mode: 'boolean' })
  outline: boolean = false;

  @attr({ mode: 'boolean' })
  ghost: boolean = false;
  
  @attr
  size: 'small' | 'medium' | 'large' = 'medium';
}
