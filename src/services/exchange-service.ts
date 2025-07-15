import { IAsset } from "./assets-config-service.js";

export interface IExchangeService {
  fetchPrice(asset: IAsset): Promise<number>;
  fetchBalance(asset: IAsset): Promise<number>;
  createMarketSellOrder(asset: IAsset, to?: string): Promise<any>;
}
