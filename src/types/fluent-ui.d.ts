// Fluent UI Web Components Type Definitions
declare namespace JSX {
  interface IntrinsicElements {
    'fluent-button': {
      appearance?: 'accent' | 'lightweight' | 'neutral' | 'outline' | 'stealth';
      size?: 'small' | 'medium' | 'large';
      disabled?: boolean;
      'click.trigger'?: string;
      style?: string;
      class?: string;
    };

    'fluent-accordion': {
      class?: string;
    };

    'fluent-accordion-item': {
      class?: string;
    };

    'fluent-data-grid': {
      class?: string;
    };

    'fluent-data-grid-row': {
      type?: 'default' | 'header';
      'repeat.for'?: string;
      class?: string;
    };

    'fluent-data-grid-cell': {
      'cell-type'?: 'default' | 'columnheader';
      'grid-column'?: string;
      class?: string;
    };

    'fluent-progress-ring': {
      style?: string;
      'if.bind'?: string;
      class?: string;
    };

    'fluent-text-field': {
      placeholder?: string;
      value?: string;
      'value.bind'?: string;
      disabled?: boolean;
      class?: string;
    };

    'fluent-checkbox': {
      checked?: boolean;
      'checked.bind'?: string;
      'change.trigger'?: string;
      class?: string;
    };
  }
}

// Global type for Fluent UI components
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'fluent-button': any;
      'fluent-accordion': any;
      'fluent-accordion-item': any;
      'fluent-data-grid': any;
      'fluent-data-grid-row': any;
      'fluent-data-grid-cell': any;
      'fluent-progress-ring': any;
      'fluent-text-field': any;
      'fluent-checkbox': any;
    }
  }
}

export { };