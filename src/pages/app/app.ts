import { DialogOpenPromise, IDialogService } from '@aurelia/dialog';
import { FluentDialogExample } from '../../dialogs/fluent-dialog-example/fluent-dialog-example.js';
import './app.css';
import { inject } from '@aurelia/kernel';
import { bindable } from 'aurelia';

@inject(IDialogService)
export class App {
  constructor(private readonly dialog: IDialogService) { }

  @bindable darkMode: boolean = true; // Start in dark mode

  p: DialogOpenPromise;
  fluentProvider: HTMLElement;

  toggleTheme(): void {
    this.darkMode = !this.darkMode;

    // Update the design system provider's base-layer-luminance
    if (this.fluentProvider) {
      this.fluentProvider.setAttribute('base-layer-luminance', this.darkMode ? '0.15' : '0.98');
    }
  }

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