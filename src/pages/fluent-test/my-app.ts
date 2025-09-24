import { bindable } from 'aurelia';

export class MyApp {
  @bindable darkMode: boolean = true; // Start in dark mode
  @bindable isDisabled: boolean = false;
  public message = 'Fluent UI Dark Mode Demo!';
  public clickCount = 0;

  constructor() {
    console.log('✅ MyApp component created');
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    this.clickCount++;
    this.message = `Switched to ${this.darkMode ? 'dark' : 'light'} mode`;
    console.log(`Switched to ${this.darkMode ? 'dark' : 'light'} mode`);

    // Update the design system provider's base-layer-luminance
    const provider = document.querySelector('fluent-design-system-provider');
    if (provider) {
      provider.setAttribute('base-layer-luminance', this.darkMode ? '0.15' : '0.98');
    }
  }

  showAlert(): void {
    this.clickCount++;
    this.message = 'Fluent UI button clicked!';
    alert('Fluent UI button clicked!');
  }
}
