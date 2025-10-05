import { AppTask, IContainer, IAttrMapper, NodeObserverLocator } from 'aurelia';

/**
 * Fluent UI Adapter for Aurelia 2
 * Provides two-way binding support for Fluent UI Web Components
 * 
 * Based on aurelia-fast-adapter but specifically designed for 
 * @fluentui/web-components with 'fluent-' prefix
 * 
 * Located in stores/ as it manages UI state coordination between
 * Aurelia and Fluent UI components according to the project architecture.
 */
export class FluentUIAdapter {

  static customize(options?: { withPrefix?: string }) {
    const prefix = options?.withPrefix || 'fluent';
    const prefixUpper = prefix.toUpperCase();

    return AppTask.creating(IContainer, container => {
      const attrMapper = container.get(IAttrMapper);
      const nodeObserverLocator = container.get(NodeObserverLocator);

      // Configure two-way binding for Fluent UI components
      attrMapper.useTwoWay((el, property) => {
        const tagName = el.tagName;

        // Handle text inputs
        if (tagName === `${prefixUpper}-TEXT-FIELD` ||
          tagName === `${prefixUpper}-TEXT-AREA` ||
          tagName === `${prefixUpper}-NUMBER-FIELD` ||
          tagName === `${prefixUpper}-SEARCH`) {
          return property === 'value';
        }

        // Handle selection components
        if (tagName === `${prefixUpper}-SELECT` ||
          tagName === `${prefixUpper}-COMBOBOX` ||
          tagName === `${prefixUpper}-LISTBOX`) {
          return property === 'value';
        }

        // Handle checkbox/toggle components
        if (tagName === `${prefixUpper}-CHECKBOX` ||
          tagName === `${prefixUpper}-SWITCH` ||
          tagName === `${prefixUpper}-RADIO`) {
          return property === 'checked';
        }

        // Handle radio group
        if (tagName === `${prefixUpper}-RADIO-GROUP`) {
          return property === 'value';
        }

        // Handle slider
        if (tagName === `${prefixUpper}-SLIDER`) {
          return property === 'value';
        }

        // Handle tabs
        if (tagName === `${prefixUpper}-TABS`) {
          return property === 'activeid';
        }

        return false;
      });

      // Configure event observation for Fluent UI components
      const valuePropertyConfig = { events: ['input', 'change'] };
      const checkedPropertyConfig = { events: ['input', 'change'] };

      nodeObserverLocator.useConfig({
        [`${prefixUpper}-TEXT-FIELD`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-TEXT-AREA`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-NUMBER-FIELD`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-SEARCH`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-SELECT`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-COMBOBOX`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-LISTBOX`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-CHECKBOX`]: {
          checked: checkedPropertyConfig
        },
        [`${prefixUpper}-SWITCH`]: {
          checked: checkedPropertyConfig
        },
        [`${prefixUpper}-RADIO`]: {
          checked: checkedPropertyConfig
        },
        [`${prefixUpper}-RADIO-GROUP`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-SLIDER`]: {
          value: valuePropertyConfig
        },
        [`${prefixUpper}-TABS`]: {
          activeid: valuePropertyConfig
        }
      });

      console.info(`✅ FluentUIAdapter configured for ${prefix}- components`);
    });
  }
}