import { DI, inject } from 'aurelia';
import { IAsset, IAssetsConfigService, AssetsConfigServiceToken } from "../assets-config-service.js";
import { IAssetExchangeService } from '../exchange-service.js';
import axios from 'axios';

export const AssetExchangeApiServiceToken = DI.createInterface<IAssetExchangeService>('AssetExchangeApiService');

@inject(AssetsConfigServiceToken)
export class AssetExchangeApiService implements IAssetExchangeService {
  constructor(private readonly configService: IAssetsConfigService) { }

  async fetchPrice(asset: IAsset): Promise<number> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/price/${encodeURIComponent(asset.name)}`,
        {
          params: {
            to: 'USDT',
          },
        }
      );
      return response.data.price;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to fetch price');
    }
  }

  async fetchBalance(asset: IAsset): Promise<number> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/balance/${encodeURIComponent(asset.name)}`,
        {
          params: {
            percentage: asset.percentage ?? 100,
          },
        }
      );
      return response.data.balance;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to fetch balance');
    }
  }

  async createMarketSellOrder(asset: IAsset, to: string = 'USDT'): Promise<unknown> {
    try {
      const response = await axios.post(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/orders/sell`, {
        asset: {
          name: asset.name,
          exchange: asset.exchange,
          percentage: asset.percentage ?? 100,
        },
        to,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to create market sell order');
    }
  }
}