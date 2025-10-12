// fluent-dialog-renderer.ts
import { IDialogDomRenderer, IDialogDom, IDialogController } from '@aurelia/dialog';

class FluentDialogDom implements IDialogDom {
  // Aurelia will project your dialog view into this:
  public readonly contentHost: HTMLElement;

  private readonly root: HTMLElement;      // <fluent-dialog>
  private readonly overlay: HTMLElement | null;

  constructor(host: Element, controller: IDialogController, { modal = true, persistent = false } = {}) {
    // A viewport container to handle positioning and scrolling
    const viewport = document.createElement('div');
    viewport.className = [
      'fixed', 'inset-0', 'z-[9999]', // Positioning
      'flex', 'justify-center', // Horizontal centering
      'overflow-y-auto', // Make the container scrollable
      'p-4' // Padding
    ].join(' ');

    const dlg = document.createElement('fluent-dialog') as any;
    dlg.modal = modal;

    if (!persistent) {
      dlg.addEventListener('cancel', (e: CustomEvent) => {
        e.preventDefault();
        // This is the correct, idiomatic way.
        // It will reject the dialog promise, which must be handled by the caller.
        controller.cancel();
      });
    }

    // The host for Aurelia's content projection
    const contentHost = document.createElement('div');
    contentHost.className = 'p-4';
    dlg.appendChild(contentHost);

    viewport.appendChild(dlg);
    host.appendChild(viewport);

    this.root = viewport; // The root is now the viewport
    this.overlay = null;
    this.contentHost = contentHost;
  }

  async show(): Promise<void> {
    const dlg = this.root.querySelector('fluent-dialog');
    if (dlg) {
      (dlg as any).open = true;
    }
    await new Promise(r => requestAnimationFrame(() => r(null)));
    this.root.focus();
  }

  async hide(): Promise<void> {
    const dlg = this.root.querySelector('fluent-dialog');
    if (dlg) {
      (dlg as any).open = false;
    }
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
