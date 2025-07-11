import { describe, it, expect, vi } from 'vitest';
import { createTestContainer, getMocksFromContainer } from './test-container-setup.js';
import { AssetList } from '../src/pages/asset-list/asset-list.js';

describe('AssetList with Test Container Helper', () => {
  it('should load assets using test container', async () => {
    // Create container with custom mocks
    const container = createTestContainer({
      assetsConfig: {
        getAssets: vi.fn().mockResolvedValue([
          {
            name: 'Bitcoin',
            symbol: 'BTC',
            exchange: 'binance',
            exchangeName: 'Binance',
            percentage: 5,
            apiUrl: 'https://api.binance.com'
          }
        ])
      }
    });

    // Get the component instance
    const assetList = container.get(AssetList);

    // Get access to mocks for assertions
    const mocks = getMocksFromContainer(container);

    // Test the functionality
    await assetList.binding();

    expect(mocks.assetsConfig.getAssets).toHaveBeenCalled();
    expect(assetList.assets).toHaveLength(1);
    expect(assetList.assets[0].name).toBe('Bitcoin');
  });

  it('should handle errors when loading assets', async () => {
    const container = createTestContainer({
      assetsConfig: {
        getAssets: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    });

    const assetList = container.get(AssetList);
    const mocks = getMocksFromContainer(container);

    // This would depend on how your component handles errors
    await expect(assetList.binding()).rejects.toThrow('API Error');
    expect(mocks.assetsConfig.getAssets).toHaveBeenCalled();
  });
});
