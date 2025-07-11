import { IExchangeApiService } from "./exchange-api-service.js";
import { IAssetsConfigService } from '../assets-config-service.js';

export class CoinExApiService {

  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IAssetsConfigService) {
    // Implementation of CoinEx API service methods
  }
}