import { bindable, customElement } from '@aurelia/runtime-html';
import './data-grid.css';

@customElement('data-grid')
export class DataGrid {
  // @bindable rowsData: any[] = [];
  @bindable class: string = '';
  @bindable style: string = '';

  constructor() {
    console.log('DataGrid custom element initialized');
  }

  // attached() {
  //   console.log('DataGrid attached with data:', this.rowsData);
  // }

  // Allow for content projection through <au-slot>
  // This enables users to define their own headers and rows
}
