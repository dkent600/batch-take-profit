import { bindable } from '@aurelia/runtime-html';
import './orders-display.css';
import { IAsset } from '../../services/assets-config-service.js';
import { IAssetExchangeService } from '../../services/interfaces.js';
import { ILogger, inject, resolve } from 'aurelia';
import { AssetExchangeApiServiceToken } from '../../services/index.js';
import { AssetsStoreToken } from '../../stores/assets-store.js';
import { IAssetsStore, IOrdersStore, IOpenedOrderListItem, IClosedOrderListItem } from '../../stores/interfaces.js';
import { OrdersStoreToken } from '../../stores/orders-store.js';

interface IOpenedOrderListItemView {
  createdAt: string,
  exchange: string,
  direction: string,
  pair: string,
  type: string,
  price: string,
  amount: string,
  orderId: string,
}

interface IClosedOrderListItemView {
  closed: string,
  pair: string,
  exchange: string,
  type: string,
  createdAt: string,
  status: string,
  coins: string,
  executedPrice: string,
  limitPrice: string,
  totalCost: string,
}

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
  fetchingOpenedOrders = false;

  async binding(): Promise<void> {
    this.fetchOpenedOrders();
    this.fetchClosedOrders();
  }

  private fetchOpenedOrders(): void {
    this.fetchingOpenedOrders = true;
    this.ordersStore.fetchOpenedOrders()
      .then((orders: IOpenedOrderListItem[]) => {
        this.openedOrders = orders.map(order => ({
          createdAt: new Date(order.createdAt).toLocaleString(),
          exchange: order.exchange,
          direction: order.direction,
          pair: order.pair,
          type: order.type,
          price: order.price,
          amount: order.amount,
          orderId: order.orderId
        }));
      })
      .finally(() => {
        this.fetchingOpenedOrders = false;
      });
  }
  private fetchClosedOrders(): void {
    this.ordersStore.fetchClosedOrders(this.baseAssets, this.quoteAssets)
      .then((orders: IClosedOrderListItem[]) => {
        this.closedOrders = orders.map(order => ({
          closed: new Date(order.closedAt).toLocaleString(),
          pair: order.pair,
          exchange: order.exchange,
          type: order.direction + (order.type === 'limit' ? ' (limit)' : ' (market)'),
          createdAt: new Date(order.createdAt).toLocaleString(),
          status: order.status,
          coins: order.status === 'executed' ? order.amountExecuted : order.amount,
          executedPrice: order.status === 'executed' ? order.price : '',
          limitPrice: order.type === 'limit' ? order.limitPrice : '',
          totalCost: order.status === 'executed' ? order.cost : ''
        }));

      });
  }

  private _openedOrders: IOpenedOrderListItemView[] = [];

  private get openedOrders(): IOpenedOrderListItemView[] {
    return this._openedOrders;
  }

  private set openedOrders(data: IOpenedOrderListItemView[]) {
    this._openedOrders = data;
  }

  private _closedOrders: IClosedOrderListItemView[] = [];

  private get closedOrders(): IClosedOrderListItemView[] {
    return this._closedOrders;
  }

  private set closedOrders(data: IClosedOrderListItemView[]) {
    this._closedOrders = data;
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

}
