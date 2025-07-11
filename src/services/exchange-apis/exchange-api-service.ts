import axios from 'axios';
import * as crypto from 'crypto';
import { DI, inject } from 'aurelia';
import { ITelegramService, TelegramServiceToken } from "../telegram-service.js";
import { ILogService, LogServiceToken } from "../log-service.js";
import { IAssetsConfigService, AssetsConfigServiceToken } from '../assets-config-service.js';

// Create a DI token for the interface
export const ExchangeApiServiceToken = DI.createInterface<IExchangeApiService>('IExchangeApiService');
export type IExchangeApiService = {
  createMarketSellOrder(pair: string, amount: number): Promise<void>;
  fetchPrice(pair: string): Promise<number>;
};

@inject(TelegramServiceToken, LogServiceToken, AssetsConfigServiceToken)
export class ExchangeApiService implements IExchangeApiService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private cachedTimeOffset = 0;

  constructor(
    private telegramsService: ITelegramService,
    private logService: ILogService,
    private configService: IAssetsConfigService) {

    this.apiKey = this.configService.apiKey;
    this.apiSecret = this.configService.apiKey;
    this.baseUrl = this.configService.baseUrl;
  }

  private getTimestampString = () => this.now().toString();

  now() {
    return this.getSynchronizedTimestamp();
    // return new Date().toISOString();
  }

  getSynchronizedTimestamp(): number {
    return Date.now() + this.cachedTimeOffset;
  }

  async getServerTime(): Promise<number> {
    const response = await axios.get(`${this.baseUrl}/api/v3/time`);
    return response.data.serverTime;
  }

  async syncTimeOffset() {
    const serverTime = await this.getServerTime();
    this.cachedTimeOffset = serverTime - Date.now();
  }

  sign(queryString: string) {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async createMarketSellOrder(coinpair: string, quantity: number) {
    const timestamp = this.getTimestampString();

    const queryString = `symbol=${coinpair}&side=SELL&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;

    const signature = this.sign(queryString);

    const url = `https://api.mexc.com/api/v3/order?${queryString}&signature=${signature}`;

    try {
      // log(`posting: ${url}`) // TEST

      const response = await axios.post(url, null, {
        headers: {
          "Content-Type": "application/json",
          'X-MEXC-APIKEY': this.apiKey,
        },
        params: {
          timestamp
        }
      });

      const alertMessage = `✅ Order placed for ${coinpair}: ${response.statusText}`;
      this.logService.log(alertMessage);
      await this.telegramsService.sendTelegramMessage(alertMessage);
    } catch (err) {
      err.message = `❌ Failed to place order for ${coinpair}: ${err}`;
      this.logService.logError(err);
      await this.telegramsService.sendTelegramMessage(err.message);
    }
  }

  async fetchPrice(pair: string): Promise<number> {
    const { data } = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
      params: { symbol: `${pair}` },
    });
    return parseFloat(data.price);
  }
}