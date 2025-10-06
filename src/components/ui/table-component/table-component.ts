import { useShadowDOM, bindable } from 'aurelia';
import './table-component.css';

/**
 * Reusable Table Component Container for Butterfly Crypto Dashboard
 * 
 * A flexible table container that works with table-component-row and table-component-cell
 * sub-components. Provides basic table structure with Fluent Design System integration
 * and loading/empty state support.
 * 
 * @example Basic Usage with Sub-Components
 * ```html
 * <table-component loading.bind="isLoading" empty-message="No data available">
 *   <table-component-row type="header">
 *     <table-component-cell cell-type="columnheader">Name</table-component-cell>
 *     <table-component-cell cell-type="columnheader" align="right">Price</table-component-cell>
 *   </table-component-row>
 *   
 *   <table-component-row repeat.for="item of tableData">
 *     <table-component-cell>${item.name}</table-component-cell>
 *     <table-component-cell align="right">${item.price | currency}</table-component-cell>
 *   </table-component-row>
 * </table-component>
 * ```
 * 
 * **Sub-Component Architecture:**
 * - `table-component-row`: Container for table rows (supports type="header" or type="data")
 * - `table-component-cell`: Individual cells (supports cell-type="columnheader" or cell-type="data")
 * - Presentation logic stays in HTML templates, not TypeScript
 * - Similar pattern to fluent-data-grid with fluent-data-grid-row/fluent-data-grid-cell
 * 
 * **Benefits:**
 * - Separation of concerns: styling in HTML, not TypeScript
 * - Flexibility: each cell can have custom content and styling
 * - Familiarity: similar API to existing Fluent UI data grid components
 * - Maintainability: presentation logic is declarative and template-based
 */
@useShadowDOM({ mode: 'open' })
export class TableComponent {
  /**
   * Loading state - shows loading spinner when true
   */
  @bindable public loading: boolean = false;

  /**
   * Message to display when no data is available
   */
  @bindable public emptyMessage: string = 'No data available';

  /**
   * Whether to show empty state when no content is slotted
   */
  @bindable public showEmptyState: boolean = true;
}