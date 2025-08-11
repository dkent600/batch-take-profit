import { DI, ILogger, inject, resolve } from "aurelia";
import { IAssetExchangeService } from "../services/interfaces.js";
import { AssetExchangeApiServiceToken } from "../services/index.js";
import { IClosedOrderListItem, IOpenedOrderListItem, IOrdersStore } from "./interfaces.js";

export const OrdersStoreToken = DI.createInterface<IOrdersStore>('IOrdersStore');

@inject(
  AssetExchangeApiServiceToken
)
export class OrdersStore implements IOrdersStore {

  constructor(
    private readonly assetExchangeService: IAssetExchangeService
  ) {

  }

  private readonly logger: ILogger = resolve(ILogger).scopeTo('OrdersStores');

  public closedOrders: IClosedOrderListItem[];
  public openOrders: IOpenedOrderListItem[];

  async fetchOpenedOrders(): Promise<IOpenedOrderListItem[]> {
    return this.assetExchangeService.fetchOpenedOrders("kraken")
      .then(orders => {
        const openOrders = orders as IOpenedOrderListItem[]; // ? new Map(Object.entries(orders)) : new Map(); // Convert to Map with property names as keys
        return this.openOrders = openOrders;
      })
      .catch(error => {
        this.logger.error('Error fetching open orders:', error);
        return [] as IOpenedOrderListItem[];
      });
  }

  async fetchClosedOrders(baseAssets: string[], quoteAssets: string[]): Promise<IClosedOrderListItem[]> {
    return this.assetExchangeService.fetchClosedOrders(baseAssets, quoteAssets)
      .then(orders => {
        const closedOrders = orders as IClosedOrderListItem[]; // ? new Map(Object.entries(orders)) : new Map(); // Convert to Map with property names as keys
        return this.closedOrders = closedOrders;
      })
      .catch(error => {
        this.logger.error('Error fetching closed orders:', error);
        return [] as IClosedOrderListItem[];
      });
  }

}