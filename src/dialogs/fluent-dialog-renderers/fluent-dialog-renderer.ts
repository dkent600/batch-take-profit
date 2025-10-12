// fluent-dialog-renderer.ts
import { IDialogDomRenderer, IDialogDom, IDialogController } from '@aurelia/dialog';

class FluentDialogDom implements IDialogDom {
  // Aurelia will project your dialog view into this:
  public readonly contentHost: HTMLElement;

  private readonly root: HTMLElement;      // <fluent-dialog>
  private readonly overlay: HTMLElement | null;

  constructor(host: Element, controller: IDialogController, { modal = true, persistent = false } = {}) {
    const dlg = document.createElement('fluent-dialog') as any;
    dlg.modal = modal;

    if (!persistent) {
      dlg.addEventListener('cancel', (e: CustomEvent) => {
        // Prevent the default cancel behavior (which is to close the dialog)
        // and instead delegate to the Aurelia dialog controller.
        e.preventDefault();
        // Close the dialog with an 'ok' status but indicate it was cancelled.
        // This avoids the unhandled promise rejection from controller.cancel().
        void controller.ok({ output: 'cancelled', wasCancelled: true });
      });
    }

    // The host for Aurelia's content projection
    const contentHost = document.createElement('div');
    // Add some padding to the content host
    contentHost.className = 'p-4';
    dlg.appendChild(contentHost);

    host.appendChild(dlg);

    this.root = dlg;
    this.overlay = null; // No longer using a manual overlay
    this.contentHost = contentHost;
  }

  async show(): Promise<void> {
    (this.root as any).open = true;
    await new Promise(r => requestAnimationFrame(() => r(null)));
    this.root.focus();
  }

  async hide(): Promise<void> {
    (this.root as any).open = false;
    await new Promise(r => requestAnimationFrame(() => r(null)));
  }

  dispose(): void {
    this.root.remove();
    this.overlay?.remove();
  }
}

export class FluentDialogRenderer implements IDialogDomRenderer<{ modal?: boolean; persistent?: boolean; }> {
  render(host: Element, controller: IDialogController, options?: { modal?: boolean; persistent?: boolean; }): IDialogDom {
    return new FluentDialogDom(host, controller, options ?? {});
  }
}
