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
  selected?: boolean;
}

// class AssetEx implements IAssetEx {
//   name: string;
//   exchange: string;
//   @watch
//   get percentage(): number
//   {
//     return this.amount / this.balance * 100;
//   }

//   @watch
//   get amount(): number {
//     return this.percentage / 100 * this.balance
//   };
//   balance?: number;
//   percentageInvalid?: boolean;
//   amountInvalid?: boolean;
//   selected?: boolean;

//   constructor(asset: IAsset) {
//     this.name = asset.name;
//     this.exchange = asset.exchange;
//     this.percentage = asset.percentage ?? 15; // Default to 15% if not provided
//     this.amount = asset.amount ?? 0; // Default to 0 if not provided
//     this.balance = asset.balance ?? 0; // Default to 0 if not provided
//     this.percentageInvalid = false;
//     this.amountInvalid = false;
//     this.selected = false;
//   }
// }

@inject(AssetsConfigServiceToken, LogServiceToken, AssetExchangeApiServiceToken)
export class AssetList {
  assets: IAssetEx[];
  private balanceUpdateTimer: NodeJS.Timeout | null = null;
  private isUpdating = false; // Flag to prevent infinite loops
  private useAmount = false;

  constructor(
    private readonly exchangeConfigService: IAssetsConfigService,
    private readonly logService: ILogService,
    private readonly assetExchangeService: IAssetExchangeService
  ) {

  }

  async binding() {
    this.assets = await this.exchangeConfigService.getAssets();
  }

  attached() {
    // Update balances every 30 seconds
    this.balanceUpdateTimer = setInterval(async () => {
      this.updateAllBalances();
    }, 30000);

    // Initial balance update
    return this.updateAllBalances();
  }

  detached() {
    if (this.balanceUpdateTimer) {
      clearInterval(this.balanceUpdateTimer);
      this.balanceUpdateTimer = null;
    }
  }

  private amountFromPercentage(asset: IAsset): number {
    return asset.percentage / 100 * asset.balance;
  }

  private percentageFromAmount(asset: IAsset): number {
    return asset.amount / asset.balance * 100;
  }

  private async updateAllBalances(): Promise<void> {
    if (!this.assets) return;

    for (const asset of this.assets) {
      try {
        const balance = await this.assetExchangeService.fetchBalance(asset);
        const balanceChanged = balance !== asset.balance;
        asset.balance = balance || 0; // Ensure balance is always a number
        if (balanceChanged) {
          if (this.useAmount) {
            asset.percentage = this.percentageFromAmount(asset);
          } else {
            asset.amount = this.amountFromPercentage(asset);
          }
        }
      } catch (error) {
        this.logService.logError(`Failed to update balance for ${asset.name}: ${error}`);
      }
      // .then(balance => {
      // this.assetExchangeService.fetchBalance(asset).then(balance => {
      //   asset.balance = balance || 0; // Ensure balance is always a number
      // }).catch(error => {
      //   this.logService.logError(`Failed to update balance for ${asset.name}: ${error}`);
      // });
    }
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


  toggleUseAmount() {
    this.useAmount = !this.useAmount;
  }

  async createSellOrder(_event: Event, asset: IAssetEx, limit: boolean = false) {
    try {
      const balance = asset.balance;
      asset.balance = await this.assetExchangeService.fetchBalance(asset);
      const balanceChanged = balance !== asset.balance;
      this.validatePercentage(asset);
      this.validateAmount(asset);

      if (balanceChanged) {
        alert(`❌ The asset balance has changed.  Make sure the numbers are still what you want.`);
        return;
      }

      if (asset.percentageInvalid || asset.amountInvalid) {
        alert(`❌ Invalid input for ${asset.name}. Please check percentage and amount.`);
        return;
      }

      this.logService.log(`Creating ${limit ? 'limit' : 'market'} sell order for ${this.useAmount ? asset.amount : (asset.percentage + '%')} of: ${asset.name}`);
      await this.assetExchangeService.createMarketSellOrder(asset);
      this.logService.log(`Created sell order for ${this.useAmount ? asset.amount : (asset.percentage + '%')} of: ${asset.name}`);
      alert(`✅ Order placed for ${asset.name}.`);
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
    return this.assets.some(asset => asset.selected && asset.percentageInvalid && asset.amountInvalid);
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
}
