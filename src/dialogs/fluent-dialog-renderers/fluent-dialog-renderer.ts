// fluent-dialog-renderer.ts
import { IDialogDomRenderer, IDialogDom, IDialogController } from '@aurelia/dialog';

class FluentDialogDom implements IDialogDom {
  // Aurelia will project your dialog view into this:
  public readonly contentHost: HTMLElement;

  private readonly root: HTMLElement;      // <fluent-dialog>
  private readonly overlay: HTMLElement | null;

  constructor(host: Element, controller: IDialogController, { modal = true, persistent = false } = {}) {
    const dlg = document.createElement('fluent-dialog') as HTMLElement;

    // default/unnamed slot host
    const body = document.createElement('div');
    body.className = [
      'flex',               // display: flex
      'items-center',       // align-items: center
      'justify-center',     // justify-content: center
      'h-full',             // height: 100%
      'w-full',             // width: 100%
      'box-border'          // box-sizing: border-box
    ].join(' ');

    // NEW: a block wrapper so your content's root (e.g., <h2>) is NOT a flex item
    const wrap = document.createElement('div');
    wrap.className = 'block'; // normal block formatting context
    body.appendChild(wrap);

    dlg.appendChild(body);

    // Optional overlay
    let overlay: HTMLElement | null = null;
    if (modal) {
      overlay = document.createElement('div');
      overlay.className = [
        'fixed', 'inset-0',      // position: fixed; inset: 0
        'bg-black/45',           // background: rgba(0,0,0,.45)
        'z-[9998]'               // z-index: 9998
      ].join(' ');
      if (!persistent) overlay.addEventListener('click', () => controller.cancel());
      host.appendChild(overlay);
    }

    // Viewport container that centers the slot host
    dlg.className = [
      'fixed', 'inset-0',        // position: fixed; inset: 0
      'grid', 'place-items-center',
      'z-[9999]',
      'outline-none'
    ].join(' ');
    dlg.tabIndex = -1;
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape' && !persistent) controller.cancel(); });

    host.appendChild(dlg);

    this.root = dlg;
    this.overlay = overlay;
    this.contentHost = wrap;
  }

  async show(): Promise<void> {
    // Fluent v2: toggling the 'open' boolean is the supported pattern
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
