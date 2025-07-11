import { inject } from 'aurelia';
import "./asset-list.css";
import { AssetsConfigServiceToken, IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';
import { IExchangeApiService, ExchangeApiServiceToken } from "../../services/exchange-apis/exchange-api-service.js";

@inject(ExchangeApiServiceToken, AssetsConfigServiceToken)
export class AssetList {
  assets: IAsset[];

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
  }
}
