import { bindable } from '@aurelia/runtime-html';
import './orders-display.css';
import { AssetsConfigServiceToken, IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/exchange-service.js';
import { ILogService, LogServiceToken } from '../../services/log-service.js';
import { inject } from 'aurelia';
import { AssetExchangeApiServiceToken } from '../../services/index.js';
import { AssetsStoreToken } from '../../stores/asset-store.js';
import { IAssetsStore, IOrdersStore } from '../../stores/stores.js';
import { OrdersStoreToken } from '../../stores/orders-store.js';

interface IAssetEx extends IAsset {
  exchange: string;
}

@inject(
  AssetExchangeApiServiceToken,
  LogServiceToken,
  OrdersStoreToken,
  AssetsStoreToken)
export class OrdersDisplay {
  constructor(
    private readonly assetExchangeService: IAssetExchangeService,
    private readonly logService: ILogService,
    private readonly ordersStore: IOrdersStore,
    private readonly assetsStore: IAssetsStore
  ) {

  }
  @bindable assets: IAssetEx[];

  async attached(): Promise<void> {
    await this.ordersStore.fetchOpenedOrders();
    await this.ordersStore.fetchClosedOrders(this.baseAssets, this.quoteAssets);
  }

  // detached() {
  //   if (this.balanceUpdateTimer) {
  //     clearInterval(this.balanceUpdateTimer);
  //     this.balanceUpdateTimer = null;
  //   }
  // }

  get baseAssets(): string[] {
    return this.assets.map(asset => asset.name);
  }

  get quoteAssets(): string[] {
    return this.assets.map(asset => this.assetsStore.getQuoteCoin(asset));
  }

  cancelOrder(txId: string): void {
    this.assetExchangeService.cancelOrder("kraken", txId)
      .then(async () => {
        alert(`✅ Order ${txId} cancelled successfully.`);
        this.ordersStore.fetchClosedOrders(this.baseAssets, this.quoteAssets);
        this.ordersStore.fetchOpenedOrders();
      })
      .catch(error => {
        console.error('Error cancelling order:', error);
        alert(`❌ Error cancelling order ${txId}. Check console for details.`);
      });
  }
}
