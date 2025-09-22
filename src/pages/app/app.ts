import { IDialogService } from '@aurelia/dialog';
import { FluentDialogExample } from '../../dialogs/fluent-dialog-example/fluent-dialog-example.js';
import './app.css';
import { inject } from '@aurelia/kernel';

@inject(IDialogService)
export class App {
  constructor(private readonly dialog: IDialogService) { }

  async open() {

    const p = this.dialog.open(
      {
        component: FluentDialogExample,
        options: { modal: true },
        model: { message: 'Hello Fluent!' }
      });
    p.whenClosed()
      .then(result => {
        console.log('closed:', result);      // should log, and the UI should close
      }); // resolve on ok/cancel/close

    // this.dialog.open({
    //   component: () => FluentDialogExample,                 // any Aurelia component
    //   model: { message: 'Hello Fluent!' },
    //   options: { modal: true, persistent: false }
    // });
  }
}
