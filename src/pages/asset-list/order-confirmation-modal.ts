import { bindable, watch } from '@aurelia/runtime-html';
import './order-confirmation-modal.css';
import { IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/interfaces.js';
import { AssetExchangeApiServiceToken } from '../../services/exchange-apis/exchange-api-service.js';
import { ILogger, inject, resolve } from '@aurelia/kernel';

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
  private readonly logger: ILogger = resolve(ILogger).scopeTo('OrderConfirmationModal');

  private safetyConfirmationInput: string = '';
  private wasProduction: boolean;
  private isProduction: boolean;
  private dialogRef: HTMLDialogElement;
  private isVisible: boolean = false;

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

  // Explicit methods for modal control
  async showModal(): Promise<void> {
    this.safetyConfirmationInput = '';
    this.isVisible = true; // Explicit visibility control

    this.fetchTestModeStatus()
      .then((mode) => this.wasProduction = mode);
  }

  hideModal(): void {
    this.isVisible = false; // Explicit visibility control
    this.safetyConfirmationInput = '';
    // Note: Don't clear pendingOrder here as it's managed by the parent component
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

  get needsSafetyCheck() {
    return this.estimatedValue > 200;
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
        this.hideModal();
        return;
      }
    }

    // Approach #4: Final safety check for very high-value orders
    if (this.needsSafetyCheck) {
      if (this.safetyConfirmationInput !== this.confirmationText) {
        alert('❌ Safety check failed. Order submission cancelled.');
        this.hideModal();
        return;
      }
    }

    try {
      await this.onExecute();
      this.hideModal(); // Explicit method call after successful execution
    } catch (error) {
      this.logger.error('Error executing order: ', error);
      this.hideModal(); // Explicit method call on error
      // alert(`❌ Error executing order for ${this.pendingOrder.name}. Check console for details.`);
    }
  }

  cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
    this.hideModal(); // Explicit method call
  }
}
