import { DI, inject } from "aurelia";
import { IAssetExchangeService } from "../services/exchange-service.js";
import { AssetExchangeApiServiceToken } from "../services/index.js";
import { LogServiceToken, ILogService } from "../services/log-service.js";
import { IClosedOrderListItem, IOpenedOrderListItem, IOrdersStore } from "./stores.js";

export const OrdersStoreToken = DI.createInterface<IOrdersStore>('IOrdersStore');

@inject(
  AssetExchangeApiServiceToken,
  LogServiceToken
)
export class OrdersStore implements IOrdersStore {

  constructor(
    private readonly assetExchangeService: IAssetExchangeService,
    private readonly logService: ILogService
  ) {

  }

  public closedOrders: IClosedOrderListItem[];
  public openOrders: IOpenedOrderListItem[];

  async fetchOpenedOrders(): Promise<IOpenedOrderListItem[]> {
    return this.assetExchangeService.fetchOpenedOrders("kraken")
      .then(orders => {
        const openOrders = orders as IOpenedOrderListItem[]; // ? new Map(Object.entries(orders)) : new Map(); // Convert to Map with property names as keys
        return this.openOrders = openOrders;
      })
      .catch(error => {
        console.error('Error fetching open orders:', error);
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
        console.error('Error fetching closed orders:', error);
        return [] as IClosedOrderListItem[];
      });
  }

}