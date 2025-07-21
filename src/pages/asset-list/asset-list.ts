import { LogServiceToken } from './../../services/log-service.js';
import { inject } from 'aurelia';
import "./asset-list.css";
import { AssetsConfigServiceToken, IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/exchange-service.js';
import { AssetExchangeApiServiceToken } from '../../services/exchange-apis/exchange-api-service.js';
import { ILogService } from '../../services/log-service.js';

interface IAssetEx extends IAsset {
  percentageInvalid?: boolean;
  amountInvalid?: boolean;
  limitOrderPriceInvalid?: boolean;
  selected?: boolean;
}

@inject(AssetsConfigServiceToken, LogServiceToken, AssetExchangeApiServiceToken)
export class AssetList {
  assets: IAssetEx[];
  // private balanceUpdateTimer: NodeJS.Timeout | null = null;
  private isUpdating = false; // Flag to prevent infinite loops
  private useAmount = false; // Flag to toggle between allowing percentage or amount to be edited
  private limitOrder = false; // Flag to indicate if limit orders should be created
  isRefreshing: boolean;

  constructor(
    private readonly exchangeConfigService: IAssetsConfigService,
    private readonly logService: ILogService,
    private readonly assetExchangeService: IAssetExchangeService
  ) {

  }

  async binding() {
    this.assets = await this.exchangeConfigService.getAssets();
    this.initAssets();
  }

  async attached(): Promise<void> {
    // Update balances every 30 seconds
    // this.balanceUpdateTimer = setInterval(async () => {
    //   this.updateAllBalances();
    // }, 30000);

    /**
     * At this point these requests need to be made one-by-one or the 
     * butterfly service will fail due to invalid nonce.
    */
    this.updateAllCurrentPrices();
    this.updateAllBalances();
  }

  // detached() {
  //   if (this.balanceUpdateTimer) {
  //     clearInterval(this.balanceUpdateTimer);
  //     this.balanceUpdateTimer = null;
  //   }
  // }

  private initAssets(): void {
    for (const asset of this.assets) {
      asset.limitOrderPrice = 0; // Initialize limit order price
    }
  }

  private amountFromPercentage(asset: IAsset): number {
    return (asset.percentage * asset.balance) / 100;
  }

  private percentageFromAmount(asset: IAsset): number {
    return (asset.amount * 100) / asset.balance;
  }

  private async updateAllCurrentPrices(): Promise<void> {

    let count = this.assets.length;

    return new Promise(resolve => {
      for (const asset of this.assets) {
        this.assetExchangeService.fetchPrice(asset, this.getToCoin(asset))
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
    this.assetExchangeService.fetchBalance(asset)
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
          this.updateAssetBalance(asset)
        } else {
          this.logService.logError(`Failed to fetch balance for ${asset.name}: ${error}`);
        }
      });
  }

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
  async refresh(): Promise<void> {
    this.isRefreshing = true;
    Promise.all([this.updateAllBalances(), this.updateAllCurrentPrices()])
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


  toggleUseAmount() {
    this.useAmount = !this.useAmount;
  }

  toggleLimitOrder() {
    this.limitOrder = !this.limitOrder;
  }

  getToCoin(asset: IAsset): string {
    return asset.exchange === 'MEXC' ? 'USDT' : 'USD';
  }

  async createSellOrder(_event: Event, asset: IAssetEx) {
    try {

      if (this.isInvalid(asset)) {
        alert(`❌ Invalid input for ${asset.name}. Please check your entries.`);
        return;
      }

      const balance = asset.balance;
      asset.balance = await this.assetExchangeService.fetchBalance(asset);
      const balanceChanged = balance !== asset.balance;
      this.validatePercentage(asset);
      this.validateAmount(asset);
      if (this.limitOrder) {
        this.validateLimitOrderPrice(asset);
      }

      if (this.isInvalid(asset)) {
        alert(`❌ Invalid input for ${asset.name}. Please check your entries.`);
        return;
      }


      if (balanceChanged) {
        alert(`❌ The asset balance has changed.  Make sure the numbers are still what you want.`);
        return;
      }

      // this.logService.log(`Creating ${this.limitOrder ? 'limit' : 'market'} sell order for ${this.useAmount ? asset.amount : (asset.percentage + '%')} of: ${asset.name}`);
      await this.assetExchangeService.createSellOrder(asset,
        this.getToCoin(asset), this.limitOrder
      );
      // this.logService.log(`Created sell order for ${this.useAmount ? asset.amount : (asset.percentage + '%')} of: ${asset.name}`);
      alert(`✅ ${this.limitOrder ? 'Limit' : 'Market'} Order placed for ${asset.name}.`);
    } catch (error) {
      this.logService.logError(error);
      alert(`❌ Error creating sell order for ${asset.name}. Check console for details.`);
    }
  }

  createSellOrders(_event: Event) {
    try {
      for (const asset of this.assets) {
        if (asset.selected) {
          this.createSellOrder(_event, asset);
        }
      }
    } catch (error) {
      console.error('Error creating sell orders:', error);
    }
  }

  get hasSelection() {
    return this.assets.some(asset => asset.selected);
  }

  // Use a getter so it always reflects the current selection
  get selectedOrders() {
    return this.assets.filter(asset => asset.selected);
  }

  get hasInvalidSelection() {
    return this.assets.some(asset => asset.selected && this.isInvalid(asset));
  }

  isInvalid(asset: IAssetEx) {
    return asset.percentageInvalid || asset.amountInvalid || (this.limitOrder && asset.limitOrderPriceInvalid);
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
      console.log('Invalid format:', originalValue, 'amountInvalidInvalid:', asset.amountInvalid);
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

  async validateLimitOrderPrice(asset: IAssetEx): Promise<void> {
    const originalValue = String(asset.limitOrderPrice);

    // Check if the string is a valid number format
    // Allows: whole numbers (4, 100), full decimals (.5, 4.5, 50.555), numbers with commas (1,000.50)
    // Rejects: "1." "4." (decimal with no digits after), "5.5.5" (multiple decimals), negative numbers, non-numeric chars except commas
    const isValidNumberFormat = /^(?!.*-)(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)$/.test(originalValue.trim());

    if (!isValidNumberFormat) {
      asset.limitOrderPriceInvalid = true;
      console.log('Invalid format:', originalValue, 'limitOrderPriceInvalid:', asset.limitOrderPriceInvalid);
      return;
    }

    const parsedValue = Number.parseFloat(originalValue);
    asset.limitOrderPriceInvalid = isNaN(parsedValue) || parsedValue <= 0;
  }
}
