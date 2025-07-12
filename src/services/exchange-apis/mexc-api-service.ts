import { DI, inject } from 'aurelia';
import { IExchangeApiService, ExchangeApiServiceToken } from "./exchange-api-service.js";
import { IAssetsConfigService, AssetsConfigServiceToken, IAsset } from "../assets-config-service.js";
import axios from 'axios';
import { ExchangeTimeSyncer, IExchangeTimeSyncer } from '../../stores/exchange-time-syncer.js';
import { IExchangeService } from '../exchange-service.js';

export const MexcApiServiceToken = DI.createInterface<MexcApiService>('MexcApiService');

@inject(ExchangeApiServiceToken, AssetsConfigServiceToken)
export class MexcApiService implements IExchangeService {
  private readonly exchangeTimeSyncer: IExchangeTimeSyncer;
  /**
   * assuming here that this is a singleton service, so we can cache the time syncers
   */
  private cachedTimeSyncers: Map<IAsset, IExchangeTimeSyncer> = new Map();

  constructor(
    private readonly exchangeApiService: IExchangeApiService,
    private readonly assetsConfigService: IAssetsConfigService) {
  }

  private async getTimeSyncer(asset: IAsset): Promise<IExchangeTimeSyncer> {
    if (!this.cachedTimeSyncers.has(asset)) {
      const timeSyncer = new ExchangeTimeSyncer(asset.exchange)
      this.cachedTimeSyncers.set(asset, timeSyncer);
      await timeSyncer.initFromServer(await this.getRealServerTime(asset));
    }
    return Promise.resolve(this.cachedTimeSyncers.get(asset));
  }

  private async getRealServerTime(asset: IAsset): Promise<number> {
    const response = await axios.get(`${asset.apiUrl}/api/v3/time`);
    return response.data.serverTime;
  }

  private async getServerTimestamp(asset: IAsset): Promise<string> {
    const timeSyncer = await this.getTimeSyncer(asset);
    return timeSyncer.getTimestampString();
  }

  createPair(asset: IAsset, to: string = 'USDT'): string {
    return `${asset.name}${to}`;
  }

  async getSellAmount(asset: IAsset): Promise<number> {
    const balance = await this.fetchBalance(asset)
    return asset.percentage / 100 * balance;
  }

  async fetchPrice(asset: IAsset): Promise<number> {
    const { data } = await axios.get(`${asset.apiUrl}/api/v3/ticker/price`, {
      params: { symbol: `${this.createPair(asset)}` },
    });
    return parseFloat(data.price);
  }

  /**
   * fetch the number of coins free for the asset
   * @param asset 
   * @returns number of coins free for the asset
   */
  async fetchBalance(asset: IAsset): Promise<number> {
    const timestamp = await this.getServerTimestamp(asset);
    const queryString = `timestamp=${timestamp}`;
    const signature = this.exchangeApiService.sign(
      queryString,
      this.assetsConfigService.getAPISecret(asset.exchange));

    const { data } = await axios.get(`${asset.apiUrl}/api/v3/account`, {
      headers: {
        'X-MEXC-APIKEY': this.assetsConfigService.getAPIKey(asset.exchange),
        "Content-Type": "application/json",
      },
      params: {
        timestamp,
        signature,
      },
    });

    let balance = 0;

    for (const coin of data.balances) {
      if (coin.asset.toLowerCase() === asset.name.toLowerCase()) {
        balance = parseFloat(coin.free);
      }
    }

    return balance;
  }

  async createMarketSellOrder(asset: IAsset, to: string = 'USDT') {

    const coinpair = this.createPair(asset, to);
    const quantity = await this.getSellAmount(asset);
    const timestamp = await this.getServerTimestamp(asset);
    const queryString = `symbol=${coinpair}&side=SELL&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;

    const signature = this.exchangeApiService.sign(queryString, this.assetsConfigService.getAPISecret(asset.exchange));

    const url = `https://api.mexc.com/api/v3/order?${queryString}&signature=${signature}`;

    const headers = {
      'X-MEXC-APIKEY': this.assetsConfigService.getAPIKey(asset.exchange),
      "Content-Type": "application/json",
    };

    return this.exchangeApiService.createMarketSellOrder(
      this.createPair(asset, to),
      quantity,
      asset.exchange,
      timestamp,
      url,
      headers);
  }
}