

import { DI, inject } from 'aurelia';
import { IAsset, IAssetsConfigService, AssetsConfigServiceToken } from "../assets-config-service.js";
import { IExchangeService } from '../exchange-service.js';
import axios from 'axios';

export const MexcApiServiceToken = DI.createInterface<MexcApiService>('MexcApiService');

@inject(AssetsConfigServiceToken)
export class MexcApiService implements IExchangeService {
  constructor(private readonly configService: IAssetsConfigService) { }

  async fetchPrice(asset: IAsset): Promise<number> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/mexc/price/${encodeURIComponent(asset.name)}`,
        {
          params: {
            apiUrl: asset.apiUrl,
            to: 'USDT',
          },
        }
      );
      return response.data.price;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch price');
    }
  }

  async fetchBalance(asset: IAsset): Promise<number> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/mexc/balance/${encodeURIComponent(asset.name)}`,
        {
          params: {
            apiUrl: asset.apiUrl,
            percentage: asset.percentage ?? 100,
          },
        }
      );
      return response.data.balance;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch balance');
    }
  }

  async createMarketSellOrder(asset: IAsset, to: string = 'USDT'): Promise<unknown> {
    try {
      const response = await axios.post(`${this.configService.serviceUrl}/api/v1/mexc/orders/sell`, {
        asset: {
          name: asset.name,
          exchange: asset.exchange,
          percentage: asset.percentage ?? 100,
          apiUrl: asset.apiUrl,
        },
        to,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to create market sell order');
    }
  }
}