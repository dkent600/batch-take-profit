import { bindable } from '@aurelia/runtime-html';
import './orders-display.css';
import { IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/interfaces.js';
import { ILogger, inject, resolve } from 'aurelia';
import { AssetExchangeApiServiceToken } from '../../services/index.js';
import { AssetsStoreToken } from '../../stores/assets-store.js';
import { IAssetsStore, IOrdersStore, IOpenedOrderListItem, IClosedOrderListItem } from '../../stores/interfaces.js';
import { OrdersStoreToken } from '../../stores/orders-store.js';
import { RequestQueueServiceToken } from '../../services/request-queue-service.js';

@inject(
  AssetExchangeApiServiceToken,
  OrdersStoreToken,
  AssetsStoreToken,)
export class OrdersDisplay {
  constructor(
    private readonly assetExchangeService: IAssetExchangeService,
    private readonly ordersStore: IOrdersStore,
    private readonly assetsStore: IAssetsStore
  ) {

  }
  @bindable assets: IAsset[];
  private readonly logger: ILogger = resolve(ILogger).scopeTo('OrdersDisplay');

  async binding(): Promise<void> {
    this.fetchOpenedOrders();
    this.fetchClosedOrders();
  }

  private fetchOpenedOrders(): void {
    this.ordersStore.fetchOpenedOrders();
  }
  private fetchClosedOrders(): void {
    this.ordersStore.fetchClosedOrders(this.baseAssets, this.quoteAssets);
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
        this.fetchClosedOrders();
        this.fetchOpenedOrders();
      })
      .catch(error => {
        this.logger.error('Error cancelling order:', error);
        alert(`❌ Error cancelling order ${txId}. Check console for details.`);
      });
  }

  // Data preparation methods for fluent-data-grid
  get openOrdersData(): IOpenedOrderListItem[] {
    if (!this.ordersStore.openOrders) return [];

    return this.ordersStore.openOrders.map(order => ({
      createdAt: new Date(order.createdAt).toLocaleString(),
      exchange: order.exchange,
      direction: order.direction,
      pair: order.pair,
      type: order.type,
      price: order.price,
      amount: order.amount,
      orderId: order.orderId
    }));
  }

  get closedOrdersData(): any[] {
    if (!this.ordersStore.closedOrders) return [];

    return this.ordersStore.closedOrders.map(order => ({
      createdAt: new Date(order.createdAt).toLocaleString(),
      closed: new Date(order.closedAt).toLocaleString(),
      exchange: order.exchange,
      pair: order.pair,
      type: order.direction + (order.type === 'limit' ? ' (limit)' : ' (market)'),
      status: order.status,
      coins: order.status === 'executed' ? order.amountExecuted : order.amount,
      executedPrice: order.status === 'executed' ? order.price : '',
      limitPrice: order.type === 'limit' ? order.limitPrice : '',
      totalCost: order.status === 'executed' ? order.cost : ''
    }));
  }
}
