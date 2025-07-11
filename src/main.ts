import { Aurelia } from 'aurelia';
import { App } from './pages/app/app.js';
import './app.css';
import { AssetList } from './pages/asset-list/asset-list.js';

Aurelia
  .register(AssetList)
  .app(App)
  .start();

