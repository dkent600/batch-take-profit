import { IExchangeApiService } from "./exchange-api-service.js";
import { IExchangeConfigService } from "./exchange-config-service.js";

export class MexcApiService {
  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IExchangeConfigService) {
  }
  // Implementation of Mexc API service methods
}