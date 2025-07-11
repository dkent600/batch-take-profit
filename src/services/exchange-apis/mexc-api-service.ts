import { inject } from 'aurelia';
import { IExchangeApiService, ExchangeApiServiceToken } from "./exchange-api-service.js";
import { IAssetsConfigService, AssetsConfigServiceToken } from "../assets-config-service.js";

@inject(ExchangeApiServiceToken, AssetsConfigServiceToken)
export class MexcApiService {
  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IAssetsConfigService) {
  }
  // Implementation of Mexc API service methods
}