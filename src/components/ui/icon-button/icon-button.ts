import { bindable, customElement, useShadowDOM } from 'aurelia';
import './icon-button.css';

@customElement('icon-button')
@useShadowDOM({ mode: 'open' })
export class IconButton {
  /** Accessible name for screen readers; REQUIRED for icon-only buttons */
  @bindable ariaLabel = '';

  /** Optional tooltip/title */
  @bindable title = '';

  /** Fluent UI appearances: 'stealth' | 'accent' | 'neutral' | 'outline' | 'lightweight' */
  @bindable appearance: 'stealth' | 'accent' | 'neutral' | 'outline' | 'lightweight' = 'stealth';

  /** Disable the button */
  @bindable disabled = false;

  /** Size preset */
  @bindable size: 'sm' | 'md' | 'lg' = 'md';

  /** Shape preset */
  @bindable shape: 'circle' | 'square' = 'circle';
}
