import { DialogOpenPromise, IDialogService } from '@aurelia/dialog';
import { FluentDialogExample } from '../../dialogs/fluent-dialog-example/fluent-dialog-example.js';
import './app.css';
import { inject } from '@aurelia/kernel';

@inject(IDialogService)
export class App {
  constructor(private readonly dialog: IDialogService) { }

  private p: DialogOpenPromise;

  async open() {
    this.p = this.dialog.open(
      {
        component: FluentDialogExample,
        options: { modal: true, persistent: false },
        model: { message: 'Hello Fluent!' }
      });

    this.p.whenClosed()
      .then(result => {
        console.log('closed:', result);
      });
  }
}