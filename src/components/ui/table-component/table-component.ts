import { useShadowDOM, bindable } from 'aurelia';

/**
 * Reusable Table Component for Butterfly Crypto Dashboard
 * 
 * A flexible, themeable table component with Fluent Design System integration
 * and TailwindCSS styling. Supports multiple column types, automatic formatting,
 * loading states, and custom action slots.
 * 
 * @example Basic Usage
 * ```html
 * <table-component 
 *   table-columns.bind="tableColumns" 
 *   table-rows.bind="tableData"
 *   loading.bind="isLoading">
 * </table-component>
 * ```
 * 
 * @example With Action Slot
 * ```html
 * <table-component table-columns.bind="tableColumns" table-rows.bind="tableData">
 *   <template au-slot="action-cell" let-item="action-item">
 *     <fluent-button click.trigger="editItem(item)">Edit</fluent-button>
 *     <fluent-button click.trigger="deleteItem(item)">Delete</fluent-button>
 *   </template>
 * </table-component>
 * ```
 * 
 * **Action Slot Documentation:**
 * - `au-slot="action-cell"` - Defines content for action column cells
 * - `let-item="action-item"` - Binds current row data to `item` variable
 * - `action-item` is the slot binding that provides access to the current table row
 * - The `item` variable contains the complete row object (ITableRow) for that row
 * - Use `item.propertyName` to access specific properties of the current row
 * - Action slots are only rendered for columns with `type: 'action'`
 * 
 * @example Advanced Action Slot Usage
 * ```html
 * <table-component table-columns.bind="tableColumns" table-rows.bind="tableData">
 *   <template au-slot="action-cell" let-item="action-item">
 *     <!-- Access row data properties -->
 *     <fluent-button click.trigger="editItem(item)" disabled.bind="item.locked">
 *       Edit ${item.name}
 *     </fluent-button>
 *     <fluent-button 
 *       click.trigger="deleteItem(item)" 
 *       if.bind="item.canDelete"
 *       appearance="stealth">
 *       Delete
 *     </fluent-button>
 *   </template>
 * </table-component>
 * ```
 * 
 * @example Column Configuration
 * ```typescript
 * tableColumns: ITableColumn[] = [
 *   { 
 *     key: 'name', 
 *     name: 'Coin Name', 
 *     type: 'text', 
 *     align: 'left' 
 *   },
 *   { 
 *     key: 'price', 
 *     name: 'Current Price', 
 *     type: 'currency', 
 *     align: 'right' 
 *   },
 *   { 
 *     key: 'change', 
 *     name: 'Change %', 
 *     type: 'percentage', 
 *     align: 'right',
 *     formatter: (value) => value > 0 ? `+${value}%` : `${value}%`
 *   },
 *   { 
 *     key: 'actions', 
 *     name: 'Actions', 
 *     type: 'action', 
 *     align: 'center' 
 *   }
 * ];
 * ```
 * 
 * @features
 * - ✅ Fluent Design System theming (automatic light/dark mode)
 * - ✅ TailwindCSS styling with tw- prefix
 * - ✅ Compact column widths (shrink to content)
 * - ✅ Responsive design with horizontal scrolling
 * - ✅ Loading states with spinner
 * - ✅ Empty state handling
 * - ✅ Custom formatters for cell values
 * - ✅ Action slots for interactive controls
 * - ✅ Shadow DOM isolation
 * - ✅ TypeScript type safety
 * 
 * @styling
 * The component uses Fluent Design System CSS custom properties:
 * - `var(--neutral-layer-1)` - Table background
 * - `var(--neutral-foreground-rest)` - Primary text
 * - `var(--accent-foreground-rest)` - Accent colors
 * - `var(--elevation-shadow)` - Drop shadows
 */

/**
 * Configuration interface for table columns
 */
export interface ITableColumn {
  /** Unique key to access data property in row objects */
  key: string;
  /** Display text for column header */
  name: string;
  /** Column data type for automatic formatting */
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'action';
  /** Text alignment within column */
  align?: 'left' | 'center' | 'right';
  /** Optional fixed width (CSS value) - use sparingly */
  width?: string;
  /** Custom formatter function for cell values */
  formatter?: (value: any, item: any) => string;
}

/**
 * Interface for table row data
 */
export interface ITableRow {
  [key: string]: any;
}

/**
 * @useShadowDOM({ mode: 'open' })
 * 
 * Enables Shadow DOM encapsulation for this component, providing:
 * 
 * **Benefits:**
 * - ✅ **Style Isolation**: Component CSS cannot leak out or be affected by external styles
 * - ✅ **DOM Encapsulation**: Component's internal DOM structure is hidden from parent
 * - ✅ **Consistent Rendering**: Immune to CSS conflicts with other components or libraries
 * - ✅ **Better Performance**: Scoped styling reduces CSS cascade complexity
 * 
 * **Mode: 'open':**
 * - Allows external JavaScript to access shadow root via `element.shadowRoot`
 * - Required for Aurelia's binding system to work properly
 * - Enables debugging and testing access to internal DOM
 * 
 * **Implications for Styling:**
 * - External CSS (including TailwindCSS) cannot penetrate shadow boundary
 * - Only CSS defined in component's .css file affects internal elements
 * - CSS custom properties (--var-name) can cross shadow boundary
 * - Fluent Design System tokens work because they use CSS custom properties
 * 
 * **Usage Notes:**
 * - Host element (table-component) can still be styled externally
 * - Internal table styling must be defined in table-component.css
 * - Fluent UI components work because they also use Shadow DOM
 * 
 * @see https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM
 */
@useShadowDOM({ mode: 'open' })
export class TableComponent {
  /** Array of column configurations defining table structure */
  @bindable tableColumns: ITableColumn[] = [];

  /** Array of row data objects to display in table */
  @bindable tableRows: ITableRow[] = [];

  /** Shows loading spinner when true */
  @bindable loading: boolean = false;

  /** Custom message displayed when data array is empty */
  @bindable emptyMessage: string = 'No data available';

  /** Enables compact spacing for dense data tables */
  @bindable compact: boolean = false;

  /**
   * Generates CSS class for column headers based on alignment and compact mode
   * @param column Column configuration object
   * @returns CSS class string for header cell
   */
  getColumnClass(column: ITableColumn): string {
    const baseClass = this.compact ? 'header-cell-compact' : 'header-cell';

    switch (column.align) {
      case 'center':
        return `${baseClass}-center`;
      case 'right':
        return `${baseClass}-right`;
      default:
        return `${baseClass}-left`;
    }
  }

  /**
   * Generates CSS class for table cells based on column type and alignment
   * @param column Column configuration object
   * @returns CSS class string for table cell
   */
  getCellClass(column: ITableColumn): string {
    const baseClass = this.compact ? 'cell-compact' : 'cell';

    switch (column.align) {
      case 'center':
        return `${baseClass}-center`;
      case 'right':
        return column.type === 'currency' || column.type === 'number'
          ? `${baseClass}-right-bold`
          : `${baseClass}-right`;
      default:
        return `${baseClass}-left`;
    }
  }

  /**
   * Formats cell values based on column type and custom formatters
   * @param value Raw cell value from data object
   * @param column Column configuration with type and formatter
   * @param item Complete row data object for context
   * @returns Formatted string for display
   */
  formatCellValue(value: any, column: ITableColumn, item: ITableRow): string {
    if (column.formatter) {
      return column.formatter(value, item);
    }

    if (value == null || value === '') {
      return '---';
    }

    switch (column.type) {
      case 'currency':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : value.toString();
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value.toString();
      case 'number':
        return typeof value === 'number' ? value.toFixed(4) : value.toString();
      default:
        return value.toString();
    }
  }

  /**
   * Returns CSS class for styling cell values based on data type
   * @param column Column configuration with type information
   * @returns CSS class string for value styling
   */
  getCellValueClass(column: ITableColumn): string {
    switch (column.type) {
      case 'currency':
        return 'currency-value';
      case 'percentage':
        return 'percentage-display';
      case 'number':
        return 'number-value';
      default:
        return '';
    }
  }
}