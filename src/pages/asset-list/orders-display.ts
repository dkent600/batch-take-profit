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
  fetchingOpenedOrders = true;
  fetchingClosedOrders = true;

  async binding(): Promise<void> {
    this.fetchOpenedOrders();
    this.fetchClosedOrders();
  }

  private fetchOpenedOrders(event?: Event): void {
    this.fetchingOpenedOrders = true;
    this.ordersStore.fetchOpenedOrders()
      .then((orders: IOpenedOrderListItem[]) => {
        this.openedOrders = orders.map(order => ({
          createdAt: this.formatDate(order.createdAt),
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
    this.fetchingClosedOrders = true;
    this.ordersStore.fetchClosedOrders(this.baseAssets, this.quoteAssets)
      .then((orders: IClosedOrderListItem[]) => {
        this.closedOrders = orders.map(order => ({
          closed: this.formatDate(order.closedAt),
          pair: order.pair,
          exchange: order.exchange,
          type: order.direction + (order.type === 'limit' ? ' (limit)' : ' (market)'),
          createdAt: this.formatDate(order.createdAt),
          status: order.status,
          coins: order.status === 'executed' ? order.amountExecuted : order.amount,
          executedPrice: order.status === 'executed' ? order.price : '',
          limitPrice: order.type === 'limit' ? order.limitPrice : '',
          totalCost: order.status === 'executed' ? order.cost : ''
        }));
      })
      .finally(() => {
        this.fetchingClosedOrders = false;
      });
  }

  private _openedOrders: IOpenedOrderListItemView[] = null;

  private get openedOrders(): IOpenedOrderListItemView[] {
    return this._openedOrders;
  }

  private set openedOrders(data: IOpenedOrderListItemView[]) {
    this._openedOrders = data;
  }

  private _closedOrders: IClosedOrderListItemView[] = null;

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

  /**
   * only show as empty if it has been loaded
   */
  ordersAreEmpty(orders: IOpenedOrderListItemView[] | IClosedOrderListItemView[]): boolean {
    return orders?.length === 0;
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

  formatDate(dt?: string): string {
    if (!dt) {
      return "";
    }

    const date = new Date(dt);

    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
