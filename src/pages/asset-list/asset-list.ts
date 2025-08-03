import { LogServiceToken } from './../../services/log-service.js';
import { inject } from 'aurelia';
import "./asset-list.css";
import { AssetsConfigServiceToken, IAssetsConfigService, IAsset } from '../../services/assets-config-service.js';
import { ILogService } from '../../services/log-service.js';


@inject(AssetsConfigServiceToken, LogServiceToken)
export class AssetList {
  assets: IAsset[];

  constructor(
    private readonly exchangeConfigService: IAssetsConfigService,
    private readonly logService: ILogService,
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