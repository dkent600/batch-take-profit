import { bindable, customElement } from 'aurelia';
import './table-grid-cell.css';

/**
 * Table cell component that works as a child of table-grid-row.
 * Supports different cell types and flexible content projection.
 */
@customElement('table-grid-cell')
export class TableGridCell {
  /**
   * Cell type - determines the HTML element and styling
   * - 'columnheader': Header cell (th element)
   * - 'data': Regular data cell (td element, default)
   */
  @bindable public cellType: 'columnheader' | 'data' = 'data';

  /**
   * Grid column position (for CSS grid or flex layouts)
   */
  @bindable public gridColumn?: string | number;

  /**
   * Text alignment for the cell content
   */
  @bindable public align: 'left' | 'center' | 'right' = 'left';

  /**
   * Get CSS class for the cell based on type
   */
  private getCellClass(): string {
    const classes = ['table-cell'];

    if (this.cellType === 'columnheader') {
      classes.push('table-header-cell');
    } else {
      classes.push('table-data-cell');
    }

    return classes.join(' ');
  }

  /**
   * Get CSS grid column style if specified, plus display and alignment
   */
  private getGridColumnStyle(): string {
    const gridStyle = this.gridColumn ? `grid-column: ${this.gridColumn};` : '';
    const displayAndAlign = `display: table-cell; text-align: ${this.align};`;
    return gridStyle ? `${gridStyle} ${displayAndAlign}` : displayAndAlign;
  }
}