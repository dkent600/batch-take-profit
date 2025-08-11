import { ILogger, inject, resolve } from 'aurelia';
import "./asset-list.css";
import { AssetsConfigServiceToken, IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';


@inject(AssetsConfigServiceToken)
export class AssetList {
  assets: IAsset[];

  constructor(
    private readonly exchangeConfigService: IAssetsConfigService
  ) {
  }

  async binding() {
    this.assets = await this.exchangeConfigService.getAssets();
    this.initAssets();
  }

  private initAssets(): void {
    for (const asset of this.assets) {
      asset.LimitPrice = 0; // Initialize limit order price
    }
  }
}