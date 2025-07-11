import { inject } from 'aurelia';
import "./asset-list.css";
import { AssetsConfigServiceToken, IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';
import { IExchangeApiService, ExchangeApiServiceToken } from "../../services/exchange-apis/exchange-api-service.js";

interface IAssetEx extends IAsset {
  percentageInvalid?: boolean;
}

@inject(ExchangeApiServiceToken, AssetsConfigServiceToken)
export class AssetList {
  assets: IAssetEx[];

  constructor(
    private readonly exchangeApiService: IExchangeApiService,
    private readonly exchangeConfigService: IAssetsConfigService
  ) {
    console.log('constructing assetlist');

  }

  async binding() {
    this.assets = await this.exchangeConfigService.getAssets();
  }

  createSellOrder(_event: Event, asset: IAsset) {
    console.log('Creating sell order for:', asset.name);
  } validatePercentage(asset: IAssetEx): void {
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
    console.log('Validated:', originalValue, 'parsed:', parsedValue, 'percentageInvalid:', asset.percentageInvalid);
  }

}
