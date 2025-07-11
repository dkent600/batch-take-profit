import { Aurelia, Registration } from 'aurelia';
import { App } from './pages/app/app.js';
import './pages/app/app.css';
import { AssetList } from './pages/asset-list/asset-list.js';
import {
  ExchangeApiService, ExchangeApiServiceToken,
  LogService, LogServiceToken,
  TelegramService, TelegramServiceToken,
  AssetsConfigService, AssetsConfigServiceToken,
  EnvService, EnvServiceToken,
  MexcApiService,
  CoinExApiService
} from './services/index.js';

Aurelia
  .register(
    // Register services with proper interface-to-implementation mapping
    Registration.singleton(ExchangeApiServiceToken, ExchangeApiService),
    Registration.singleton(LogServiceToken, LogService),
    Registration.singleton(TelegramServiceToken, TelegramService),
    Registration.singleton(AssetsConfigServiceToken, AssetsConfigService),
    Registration.singleton(EnvServiceToken, EnvService),
    Registration.singleton(MexcApiService, MexcApiService),
    Registration.singleton(CoinExApiService, CoinExApiService),
    AssetList
  )
  .app(App)
  .start();

