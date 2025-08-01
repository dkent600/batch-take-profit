import { DI } from "aurelia";
import { IAsset } from "../services/assets-config-service.js";
import { IAssetsStore } from "./interfaces.js";

export const AssetsStoreToken = DI.createInterface<IAssetsStore>('IAssetsStore');

export class AssetsStore implements IAssetsStore {
  public getQuoteCoin(asset: IAsset): string {
    return asset.exchange === 'MEXC' ? 'USDT' : 'USD';
  }
}