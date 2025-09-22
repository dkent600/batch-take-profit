// src/shared/my-dialog.ts
import { DialogController } from '@aurelia/dialog';
import { inject } from 'aurelia';

@inject(DialogController)
export class FluentDialogExample {
  constructor(public controller: DialogController) { }

  public message!: string;

  // called when the dialog is created; receives the 'model' you passed to open(...)
  activate(model?: { message?: string }) {
    this.message = model?.message ?? '';
  }

  ok() {
    this.controller.ok('done');
  }

  cancel() {
    this.controller.cancel();
  }
}
