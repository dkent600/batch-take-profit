import axios from 'axios';
import * as crypto from 'crypto';
import { DI, inject } from 'aurelia';
import { ITelegramService, TelegramServiceToken } from "../telegram-service.js";
import { ILogService, LogServiceToken } from "../log-service.js";

// Create a DI token for the interface
export const ExchangeApiServiceToken = DI.createInterface<IExchangeApiService>('IExchangeApiService');
export type IExchangeApiService = {

  createMarketSellOrder(
    coinpair: string,
    quantity: number,
    exchangeName: string,
    timestamp: string,
    apiUrl: string,
    headers: Record<string, string>): Promise<void>;

  sign(queryString: string, apiSecret: string)
};

@inject(TelegramServiceToken, LogServiceToken)
export class ExchangeApiService implements IExchangeApiService {
  constructor(
    private telegramsService: ITelegramService,
    private logService: ILogService) {
  }

  sign(queryString: string, apiSecret: string): string {
    return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
  }

  /**
   * Create a market sell order.
   * @param coinpair `${from}${to}`
   * @param quantity of tokens to sell
   * @param exchangeName The exchange to use for the order
   */
  async createMarketSellOrder(
    coinpair: string,
    quantity: number,
    exchangeName: string,
    timestamp: string,
    apiUrl: string,
    headers: Record<string, string>): Promise<void> {


    try {
      // log(`posting: ${url}`) // TEST

      const response = await axios.post(apiUrl, null, {
        headers,
        params: {
          timestamp
        }
      });

      const alertMessage = `✅ Order placed with ${exchangeName} for ${quantity} ${coinpair}: ${response.statusText}`;
      this.logService.log(alertMessage);
      await this.telegramsService.sendTelegramMessage(alertMessage);
    } catch (err) {
      err.message = `❌ Failed to place order with ${exchangeName} for ${quantity} ${coinpair}: ${err}`;
      this.logService.logError(err);
      await this.telegramsService.sendTelegramMessage(err.message);
    }
  }
}