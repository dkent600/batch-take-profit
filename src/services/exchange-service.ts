import { IAsset } from "./assets-config-service.js";

export interface IAssetExchangeService {
  fetchPrice(asset: IAsset, to: string): Promise<number>;
  fetchBalance(asset: IAsset): Promise<number>;
  createSellOrder(asset: IAsset, to: string, limit: boolean): Promise<unknown>;
  fetchOpenedOrders(exchange: string): Promise<[]>;
  fetchClosedOrders(baseCoins: string[], quoteCoins: string[]): Promise<[]>;
  cancelOrder(exchange: string, txId: string): Promise<unknown>;
}
