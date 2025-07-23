import { DI, inject } from 'aurelia';
import { IAsset, IAssetsConfigService, AssetsConfigServiceToken } from "../assets-config-service.js";
import { IAssetExchangeService } from '../exchange-service.js';
import axios from 'axios';

export const AssetExchangeApiServiceToken = DI.createInterface<IAssetExchangeService>('AssetExchangeApiService');

@inject(AssetsConfigServiceToken)
export class AssetExchangeApiService implements IAssetExchangeService {
  constructor(private readonly configService: IAssetsConfigService) { }

  /**
   * Fetch from the exchange API an exchange rate of an asset.
   * @param asset 
   * @param to if MexC should be USDT.  Kraken, USD
   * @returns 
   */
  async fetchPrice(asset: IAsset, to: string): Promise<number> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/price/${encodeURIComponent(asset.name)}`,
        {
          params: {
            to,
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
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/balance/${encodeURIComponent(asset.name)}`);
      return response.data.balance;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to fetch balance');
    }
  }

  async createSellOrder(asset: IAsset, to: string, limit: boolean): Promise<unknown> {
    try {
      asset.amount = +asset.amount || 0; // Ensure amount is a number
      asset.limitOrderPrice = +asset.limitOrderPrice || 0;

      if (!asset.amount) {
        throw new Error('Amount is required to create a market sell order');
      }
      if (limit && !asset.limitOrderPrice) {
        throw new Error('Limit price is required to create a limit sell order');
      }
      const response = await axios.post(`${this.configService.serviceUrl}/api/v1/${asset.exchange.toLocaleLowerCase()}/orders/sell/${limit ? "limit" : "market"}`, {
        name: asset.name,
        amount: asset.amount,
        price: asset.limitOrderPrice, // will be ignored for market orders
        to,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to create market sell order');
    }
  }

  async fetchOpenOrders(exchange: string): Promise<[]> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${exchange.toLocaleLowerCase()}/orders/opened`);
      return response.data.orders;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to fetch open orders');
    }
  }

  async fetchClosedOrders(exchange: string): Promise<[]> {
    try {
      const response = await axios.get(`${this.configService.serviceUrl}/api/v1/${exchange.toLocaleLowerCase()}/orders/closed`);
      return response.data.orders;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(err?.response?.data?.message || err.message || 'Failed to fetch closed orders');
    }
  }

  async cancelOrder(exchange: string, txId: string): Promise<void> {
    if (!txId) {
      throw new Error('Transaction ID is required to cancel an order');
    }

    const url = `${this.configService.serviceUrl}/api/v1/${exchange.toLocaleLowerCase()}/orders/cancel/${txId}`;

    try {
      await axios.delete(url);
    }
    catch (error) {
      const err = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
          headers?: unknown;
        };
        message?: string;
        request?: unknown;
      };

      console.log('Cancel order error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers
        } : null,
        hasRequest: !!err.request
      });

      throw new Error(
        (err?.response?.data as { message?: string })?.message || err.message || 'Failed to cancel order'
      );
    }
  }
}