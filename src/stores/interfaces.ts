import { IAsset } from "../services/assets-config-service.js";

export interface IAssetsStore {
  getQuoteCoin(asset: IAsset): string;
}

export interface IOpenedOrderListItem {
  orderId: string;
  pair: string;
  price: string;
  amount: string;
  direction: 'buy' | 'sell';
  type: 'market' | 'limit';
  createdAt: string;
  exchange: string;
}

export interface IClosedOrderListItem {
  orderId: string;
  pair: string;
  price: string;
  amount: string;
  direction: 'buy' | 'sell';
  type: 'market' | 'limit';
  status: string;
  amountExecuted: string;
  limitPrice: string;
  cost: string;
  createdAt: string;
  closedAt: string;
  exchange: string;
}

export interface IOrdersStore {
  closedOrders: IClosedOrderListItem[];
  openOrders: IOpenedOrderListItem[];
  fetchOpenedOrders(): Promise<IOpenedOrderListItem[]>;
  fetchClosedOrders(baseAssets: string[], quoteAssets: string[]): Promise<IClosedOrderListItem[]>;
}