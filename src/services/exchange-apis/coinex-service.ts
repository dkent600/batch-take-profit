import { inject } from 'aurelia';
import { IExchangeApiService, ExchangeApiServiceToken } from "./exchange-api-service.js";
import { IAssetsConfigService, AssetsConfigServiceToken } from '../assets-config-service.js';

@inject(ExchangeApiServiceToken, AssetsConfigServiceToken)
export class CoinExApiService {

  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IAssetsConfigService) {
    // Implementation of CoinEx API service methods
  }
}