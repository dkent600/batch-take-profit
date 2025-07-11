import { IExchangeApiService } from "./exchange-api-service.js";
import { IAssetsConfigService } from "../assets-config-service.js";

export class MexcApiService {
  constructor(
    private exchangeApiService: IExchangeApiService,
    private exchangeConfigService: IAssetsConfigService) {
  }
  // Implementation of Mexc API service methods
}