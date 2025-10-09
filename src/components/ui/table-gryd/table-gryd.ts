import { bindable, customElement } from 'aurelia';
import './table-gryd.css';

@customElement('table-gryd')
export class TableGryd {
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