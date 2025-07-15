import { IAsset } from "./assets-config-service.js";

export interface IExchangeService {
  createPair(asset: IAsset, to?: string): string;
  getSellAmount(asset: IAsset): Promise<number>;
  fetchPrice(asset: IAsset): Promise<number>;
  fetchBalance(asset: IAsset): Promise<number>;
  createMarketSellOrder(asset: IAsset, to?: string): Promise<unknown>;
}
