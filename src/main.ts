import { Aurelia } from 'aurelia';
import { App } from './app.js';
import './app.css';
import { AssetList } from './asset-list.js';

Aurelia
.register(AssetList)
  .app(App)
  .start();

