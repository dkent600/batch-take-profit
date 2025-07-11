import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as crypto from 'crypto';
import ITelegramService from "../telegram-service.ts";

export interface IExchangeApiService {
  createMarketSellOrder(pair: string, amount: number): Promise<void>;
}

export class ExchangeApiService implements IExchangeApiService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private logFileName: string
  private cachedTimeOffset = 0;

  constructor(private telegramsService: ITelegramService) {
    dotenv.config();
    this.apiKey = process.env.API_KEY || '';
    this.apiSecret = process.env.API_SECRET || '';
    this.baseUrl = process.env.BASE_URL || '';
    this.logFileName = process.env.LOG_FILE_NAME || 'exchange-api.log';
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

  log(report: string | string[]): void {
    if (!Array.isArray(report)) {
      report = [report];
    }
    const _log = [...report].join('\n');

    fs.appendFileSync(this.logFileName, _log + '\n');
    console.log(_log);
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
      log(alertMessage);
      await this.telegramsService.sendTelegramMessage(alertMessage);
    } catch (err) {
      const alertMessage = `❌ Failed to place order for ${coinpair}: ${err}`;
      log(alertMessage);
      await this.telegramsService.sendTelegramMessage(alertMessage);
    }
  }

  async fetchPrice(pair: string): Promise<number> {
    const { data } = await axios.get(`${this.baseUrl}/api/v3/ticker/price`, {
      params: { symbol: `${pair}` },
    });
    return parseFloat(data.price);
  }
}