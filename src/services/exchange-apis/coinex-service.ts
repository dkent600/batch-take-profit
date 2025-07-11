import { IExchangeApiService } from "./exchange-api-service.js";
import { IExchangeConfigService } from './exchange-config-service.js';

export class CoinExApiService {

  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IExchangeConfigService) {
    // Implementation of CoinEx API service methods
  }
}