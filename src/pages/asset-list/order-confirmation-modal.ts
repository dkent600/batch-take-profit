import { bindable, watch } from '@aurelia/runtime-html';
import './order-confirmation-modal.css';
import { IAsset } from '../../services/assets-config-service.js';

interface IAssetEx extends IAsset {
  percentageInvalid?: boolean;
  amountInvalid?: boolean;
  LimitPriceInvalid?: boolean;
  selected?: boolean;
  direction: 'buy' | 'sell';
  limit: boolean;
}

export class OrderConfirmationModal {
  @bindable pendingOrder: IAssetEx | null = null;
  @bindable quoteCoin: string = '';
  @bindable onExecute: () => Promise<void>;
  @bindable onCancel: () => void;

  safetyConfirmationInput: string = '';

  get isOpen(): boolean {
    return this.pendingOrder !== null;
  }

  get estimatedValue(): number {
    if (!this.pendingOrder) return 0;
    const price = this.pendingOrder.limit ? this.pendingOrder.LimitPrice : this.pendingOrder.currentPrice;
    return this.pendingOrder.amount * price;
  }

  get confirmationText(): string {
    if (!this.pendingOrder) return '';
    return `EXECUTE ${this.pendingOrder.direction.toUpperCase()}`;
  }

  get isTestMode(): boolean {
    // Check if we're in test mode based on environment or settings
    return !window.location.hostname.includes('production') &&
      (window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1') ||
        window.location.hostname.includes('dev'));
  }

  async executeOrder(): Promise<void> {
    if (!this.pendingOrder) return;

    // Approach #4: Final safety check for very high-value orders
    if (this.estimatedValue > 5000) {
      if (this.safetyConfirmationInput !== this.confirmationText) {
        alert('❌ Safety check failed. Order cancelled.');
        this.cancel();
        return;
      }
    }

    try {
      await this.onExecute();
    } catch (error) {
      console.error('Error executing order:', error);
    } finally {
      this.resetModal();
    }
  }

  cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.resetModal();
  }

  private resetModal(): void {
    this.pendingOrder = null;
    this.safetyConfirmationInput = '';
  }

  // Reset safety input when order changes
  @watch("pendingOrder")
  pendingOrderChanged(_newVal: IAssetEx | null, _oldVal: IAssetEx | null): void {
    this.safetyConfirmationInput = '';
  }
}
