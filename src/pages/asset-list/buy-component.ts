import { bindable } from '@aurelia/runtime-html';
import './buy-component.css';
import { IAsset } from '../../services/assets-config-service.js';
import { ILogService, LogServiceToken } from '../../services/log-service.js';
import { AssetsStoreToken } from '../../stores/asset-store.js';
import { inject } from 'aurelia';
import { IAssetExchangeService, IRequestQueueService } from '../../services/interfaces.js';
import { AssetExchangeApiServiceToken } from '../../services/exchange-apis/exchange-api-service.js';
import { OrdersStoreToken } from '../../stores/orders-store.js';
import { IAssetsStore, IOrdersStore } from '../../stores/interfaces.js';
import { RequestQueueServiceToken } from '../../services/request-queue-service.js';

interface IAssetEx extends IAsset {
  percentageInvalid?: boolean;
  amountInvalid?: boolean;
  LimitPriceInvalid?: boolean;
  selected?: boolean;
}

@inject(
  AssetExchangeApiServiceToken,
  LogServiceToken,
  OrdersStoreToken,
  RequestQueueServiceToken,
  AssetsStoreToken
)
export class BuyComponent {
  constructor(
    private readonly assetExchangeService: IAssetExchangeService,
    private readonly logService: ILogService,
    private readonly ordersStore: IOrdersStore,
    private readonly queueService: IRequestQueueService,
    private readonly assetsStore: IAssetsStore) {
  }

  @bindable assets: IAssetEx[] = [];

  // Internal state - no longer bound to parent
  useAmount: boolean = false;
  limitOrder: boolean = false;
  isRefreshing: boolean = false;
  isUpdating = false; // Flag to prevent infinite loops

  async attached(): Promise<void> {
    /**
     * At this point these requests need to be made one-by-one or the 
     * butterfly service will fail due to invalid nonce.
    */
    // this.queueService.enqueue(() => this.updateAllCurrentPrices());
    // this.queueService.enqueue(() => this.updateAllBalances());
    this.updateAllCurrentPrices();
    this.updateAllBalances();
  }

  get hasSelection(): boolean {
    return this.assets.some(asset => asset.selected);
  }

  get selectedOrders(): IAssetEx[] {
    return this.assets.filter(asset => asset.selected);
  }

  get hasInvalidSelection(): boolean {
    return this.assets.some(asset => asset.selected && this.isInvalid(asset));
  }

  // Selection methods
  selectAll() {
    for (const asset of this.assets) {
      asset.selected = true;
    }
  }

  selectNone() {
    for (const asset of this.assets) {
      asset.selected = false;
    }
  }

  // Toggle methods
  toggleUseAmount() {
    this.useAmount = !this.useAmount;
  }

  toggleLimitOrder() {
    this.limitOrder = !this.limitOrder;
  }

  private async updateAllCurrentPrices(): Promise<void> {

    let count = this.assets.length;

    return new Promise(resolve => {
      for (const asset of this.assets) {
        this.assetExchangeService.fetchPrice(asset, this.assetsStore.getQuoteCoin(asset))
          .then(price => {
            asset.currentPrice = price;
            if (--count === 0) {
              resolve();
            }
          })
          .catch(error => {
            this.logService.logError(`Failed to fetch current price for ${asset.name}: ${error}`);
          });
      }
    });
  }

  private async updateAllBalances(): Promise<void> {
    let count = this.assets.length;
    return new Promise(resolve => {
      for (const asset of this.assets) {
        this.updateAssetBalance(asset)
          .then(() => {
            if (--count === 0) {
              resolve();
            }
          });
      }
    });
  }

  private async updateAssetBalance(asset: IAssetEx): Promise<void> {
    return this.assetExchangeService.fetchBalance(asset)
      .then(balance => {
        const balanceChanged = balance !== asset.balance;
        asset.balance = balance || 0; // Ensure balance is always a number
        if (balanceChanged) {
          /**
           * assumes that if the balance changes, the user wants to update the percentage or amount
           * based on the new balance, but only if the user is not currently editing
           * the percentage or amount to avoid infinite loops and overwriting the user's entry.
           * The user may not be aware of this behavior which could be a problem
           * but it is a common pattern in financial applications to update the percentage or amount
           * based on the new balance when the balance changes.
           */
          if (this.useAmount) {
            // user may not be aware that the amount they are editing is 
            // no longer based on the balance
            asset.percentage = this.percentageFromAmount(asset);
          } else {
            // user may not be aware that the percentage they are editing is 
            // no longer based on the amount
            asset.amount = this.amountFromPercentage(asset);
          }
        }
      })
      .catch(error => {
        // Check for invalid nonce error and retry once
        if (error.message && error.message.includes('EAPI:Invalid nonce')) {
          this.logService.log(`Invalid nonce error for ${asset.name}, retrying...`);
          /**
           * we receive intermittent invalid nonce errors due to being unable to avoid
           * requests to the exchange arriving out of order.  So we do the retry.
           * Note it is recursive, assuming it the error won't happen forever.
           */
          return this.updateAssetBalance(asset);
        } else {
          this.logService.logError(`Failed to fetch balance for ${asset.name}: ${error}`);
        }
      });
  }

  // Handle refresh event from TradingGrid
  async refresh(): Promise<void> {
    this.isRefreshing = true;
    return Promise.all([this.queueService.enqueue(() => this.updateAllBalances()), this.queueService.enqueue(() => this.updateAllCurrentPrices())])
      .then(() => {
        this.isRefreshing = false;
        // wait so isRefreshing can take effect, then show the alert (which otherwise would
        // freeze the page refresh) 
        this.run(() => alert('✅ All balances refreshed.'), 100);
      });
  }

  run(fn: () => void, ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(() => { fn(); resolve(); }, ms));
  }

  // Order creation - now handled internally
  async createBuyOrders(): Promise<void> {
    const selectedAssets = this.selectedOrders;
    for (const asset of selectedAssets) {
      await this._createBuyOrder(asset, this.limitOrder).catch(error => {
        console.error('Error creating buy orders:', error);
      });
    }
    this.ordersStore.fetchOpenedOrders();
  }

  // Validation methods
  isInvalid(asset: IAssetEx): boolean {
    return asset.percentageInvalid || asset.amountInvalid || (this.limitOrder && asset.LimitPriceInvalid);
  }

  async _createBuyOrder(asset: IAssetEx, limitOrder: boolean): Promise<void> {
    const nullPromise = Promise.resolve();
    try {
      if (this.isInvalid(asset)) {
        alert(`❌ Invalid input for ${asset.name}. Please check your entries.`);
        return nullPromise;
      }

      const balance = asset.balance;
      asset.balance = await this.assetExchangeService.fetchBalance(asset);
      const balanceChanged = balance !== asset.balance;
      this.validatePercentage(asset);
      this.validateAmount(asset);
      if (limitOrder) {
        this.validateLimitPrice(asset);
      }

      if (this.isInvalid(asset)) {
        alert(`❌ Invalid input for ${asset.name}. Please check your entries.`);
        return nullPromise;
      }

      if (balanceChanged) {
        alert(`❌ The asset balance has changed.  Make sure the numbers are still what you want.`);
        return nullPromise;
      }

      return this.assetExchangeService.createBuyOrder(asset, this.assetsStore.getQuoteCoin(asset), limitOrder)
        .then(() => {
          alert(`✅ ${limitOrder ? 'Limit' : 'Market'} Buy Order placed for ${asset.name}.`);
        });
    } catch (error) {
      this.logService.logError(error);
      alert(`❌ Error creating buy order for ${asset.name}. Check console for details.`);
      return nullPromise;
    }
  }

  async createBuyOrder(asset: IAssetEx, limitOrder: boolean) {
    await this._createBuyOrder(asset, limitOrder);
    this.ordersStore.fetchOpenedOrders();
  }

  async validatePercentage(asset: IAssetEx): Promise<void> {
    if (this.isUpdating) return;

    const originalValue = String(asset.percentage);

    // Check if the string is a valid number format
    // Allows: whole numbers (4, 100), full decimals (.5, 4.5, 50.555)
    // Rejects: "1." "4." (decimal with no digits after), "5.5.5" (multiple decimals), "5%" etc.
    const isValidNumberFormat = /^(\d+\.\d+|\d+|\.\d+)$/.test(originalValue.trim());

    if (!isValidNumberFormat) {
      asset.percentageInvalid = true;
      console.log('Invalid format:', originalValue, 'percentageInvalid:', asset.percentageInvalid);
      return;
    }

    const parsedValue = Number.parseFloat(originalValue);
    asset.percentageInvalid = isNaN(parsedValue) || parsedValue <= 0 || parsedValue > 100;

    // Update amount based on percentage if valid and balance is available
    if (!asset.percentageInvalid && asset.balance) {
      this.isUpdating = true;
      asset.amount = (parsedValue / 100) * asset.balance;
      this.isUpdating = false;
    }
  }

  async validateAmount(asset: IAssetEx): Promise<void> {
    if (this.isUpdating) return;

    const originalValue = String(asset.amount);

    // Check if the string is a valid number format
    // Allows: whole numbers (4, 100), full decimals (.5, 4.5, 50.555), numbers with commas (1,000.50)
    // Rejects: "1." "4." (decimal with no digits after), "5.5.5" (multiple decimals), negative numbers, non-numeric chars except commas
    const isValidNumberFormat = /^(?!.*-)(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)$/.test(originalValue.trim());

    if (!isValidNumberFormat) {
      asset.amountInvalid = true;
      console.log('Invalid format:', originalValue, 'amountInvalid:', asset.amountInvalid);
      return;
    }

    const parsedValue = Number.parseFloat(originalValue);
    asset.amountInvalid = isNaN(parsedValue) || parsedValue < 0;

    // Update percentage based on amount if valid and balance is available
    if (!asset.amountInvalid && asset.balance && parsedValue > 0) {
      this.isUpdating = true;
      asset.percentage = (parsedValue / asset.balance) * 100;
      this.isUpdating = false;
    }
  }

  async validateLimitPrice(asset: IAssetEx): Promise<void> {
    const originalValue = String(asset.LimitPrice);

    // Check if the string is a valid number format
    // Allows: whole numbers (4, 100), full decimals (.5, 4.5, 50.555), numbers with commas (1,000.50)
    // Rejects: "1." "4." (decimal with no digits after), "5.5.5" (multiple decimals), negative numbers, non-numeric chars except commas
    const isValidNumberFormat = /^(?!.*-)(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)$/.test(originalValue.trim());

    if (!isValidNumberFormat) {
      asset.LimitPriceInvalid = true;
      console.log('Invalid format:', originalValue, 'LimitPriceInvalid:', asset.LimitPriceInvalid);
      return;
    }

    const parsedValue = Number.parseFloat(originalValue);
    asset.LimitPriceInvalid = isNaN(parsedValue) || parsedValue <= 0;
  }

  private amountFromPercentage(asset: IAsset): number {
    return (asset.percentage * asset.balance) / 100;
  }

  private percentageFromAmount(asset: IAsset): number {
    return (asset.amount * 100) / asset.balance;
  }

}
