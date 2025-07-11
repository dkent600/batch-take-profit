import "./asset-list.css";
import { IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';
import { IExchangeApiService } from "../../services/exchange-apis/exchange-api-service.js";

export class AssetList {
  assets: IAsset[];

  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IAssetsConfigService
  ) {
  }

  async binding() {
    this.assets = await this.exchangeConfigService.getAssets();
  }

  createSellOrder(_event: Event, asset: IAsset) {
    console.log('Creating sell order for:', asset.name);
  }
}
