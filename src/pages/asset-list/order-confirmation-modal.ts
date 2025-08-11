import { bindable, watch } from '@aurelia/runtime-html';
import './order-confirmation-modal.css';
import { IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/interfaces.js';
import { AssetExchangeApiServiceToken } from '../../services/exchange-apis/exchange-api-service.js';
import { inject } from '@aurelia/kernel';

interface IAssetEx extends IAsset {
  percentageInvalid?: boolean;
  amountInvalid?: boolean;
  LimitPriceInvalid?: boolean;
  selected?: boolean;
  direction: 'buy' | 'sell';
  limit: boolean;
}

@inject(AssetExchangeApiServiceToken)
export class OrderConfirmationModal {
  /** 
   * pendingOrder set or not set determines whether the modal is visible
   */
  @bindable pendingOrder: IAssetEx | null = null;
  @bindable quoteCoin: string = '';
  @bindable onExecute: () => Promise<void>;
  @bindable onCancel: () => void;

  private safetyConfirmationInput: string = '';
  private wasProduction: boolean;
  private isProduction: boolean;

  constructor(
    private exchangeService: IAssetExchangeService
  ) {
    // No initialization here - we'll check when needed
  }

  private async fetchTestModeStatus(): Promise<boolean> {
    return this.exchangeService.isProduction()
      .then((mode: boolean) => {
        return this.isProduction = mode;
      })
      .catch((error) => {
        this.logger.error('Failed to determine production mode: ', error);
        alert(`❌ Failed to determine production mode for ${this.pendingOrder.name}. Check console for details.`);
        throw new Error('Failed to determine production mode');
      });
  }

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

  /***
   * user clicks Submit
   */
  async executeOrder(): Promise<void> {
    if (!this.pendingOrder) return;

    // Check production mode again before executing the order
    await this.fetchTestModeStatus();
    const modeChanged = (this.isProduction !== this.wasProduction);

    // Check if the production mode has changed since the modal opened
    if (modeChanged) {
      const modeMessage = this.isProduction ? 'test to production' : 'production to test';
      const proceed = confirm(
        `⚠️ WARNING: The system mode has changed from ${modeMessage} mode since this order was prepared.\n\n` +
        `Current mode: ${this.isProduction ? 'PRODUCTION' : 'TEST'}\n\n` +
        'Do you want to proceed with this order?'
      );

      if (!proceed) {
        /**
         * this will close the modal.
         */
        this.closeModal();
        return;
      }
    }

    // Approach #4: Final safety check for very high-value orders
    if (this.estimatedValue > 200) {
      if (this.safetyConfirmationInput !== this.confirmationText) {
        alert('❌ Safety check failed. Order submission cancelled.');
        this.closeModal();
        return;
      }
    }

    try {
      await this.onExecute();
    } catch (error) {
      this.logger.error('Error executing order: ', error);
      // alert(`❌ Error executing order for ${this.pendingOrder.name}. Check console for details.`);
    }
  }

  cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.closeModal();
  }

  private closeModal(): void {
    this.pendingOrder = null;
    this.safetyConfirmationInput = '';
  }

  // Update state when pendingOrder changes
  async pendingOrderChanged(_newVal: IAssetEx | null, _oldVal: IAssetEx | null): Promise<void> {
    this.safetyConfirmationInput = '';

    // Check production mode when modal becomes visible (pendingOrder is set)
    if (_newVal !== null) {
      this.fetchTestModeStatus()
        .then((mode) => this.wasProduction = mode); // Store initial state when modal opens
    }
  }
}
