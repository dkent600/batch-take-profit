import { customElement } from 'aurelia';

@customElement('asset-list')
export class AssetList {
  assets = [];

  async binding() {
    // Fetch config.json from the public root
    const response = await fetch('/config.json');
    const config = await response.json();
    const exchanges = (config.batchConfig?.exchanges ?? []);
    const exchangeMap = Object.fromEntries(exchanges.map(e => [e.name, e]));
    this.assets = (config.batchConfig?.assets ?? []).map(asset => ({
      name: asset.name,
      exchange: asset.exchange,
      exchangeName: asset.exchange,
      percentage: asset.percentage ?? 15,
      apiUrl: exchangeMap[asset.exchange]?.apiUrl || ''
    }));
  }
}
