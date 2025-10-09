import { bindable, customElement } from 'aurelia';
import './table-gryd-cell.css';

/**
 * Table cell component that works as a child of table-gryd-row.
 * Supports different cell types and flexible content projection.
 */
@customElement('table-gryd-cell')
export class TableGrydCell {
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
   * Get CSS class for the cell based on type and alignment
   */
  private getCellClass(): string {
    const classes = ['table-cell'];

    if (this.cellType === 'columnheader') {
      classes.push('table-header-cell');
    } else {
      classes.push('table-data-cell');
    }

    // Add TailwindCSS alignment classes - these now work without Shadow DOM
    switch (this.align) {
      case 'center':
        classes.push('tw-text-center');
        break;
      case 'right':
        classes.push('tw-text-right');
        break;
      default:
        classes.push('tw-text-left');
        break;
    }

    return classes.join(' ');
  }

  /**
   * Get inline style for grid positioning if specified
   */
  private getGridColumnStyle(): string {
    if (this.gridColumn) {
      return `grid-column: ${this.gridColumn};`;
    }
    return '';
  }
}