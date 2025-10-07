import { bindable, customElement } from 'aurelia';
import './table-grid-row.css';
/**
 * Table row component that works as a child of table-grid.
 * Supports header rows and data rows with proper styling.
 */
@customElement('table-grid-row')
export class TableGridRow {
  /**
   * Row type - determines styling and behavior
   * - 'header': Header row with column headers
   * - 'data': Regular data row (default)
   */
  @bindable public type: 'header' | 'data' = 'data';

  /**
   * Get CSS class for the row based on type
   */
  private getRowClass(): string {
    return this.type === 'header' ? 'table-header-row' : 'table-data-row';
  }
}