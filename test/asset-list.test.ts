import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestContainer, getMocksFromContainer } from './test-container-setup.js';
import { AssetList } from '../src/pages/asset-list/asset-list.js';

interface TestAsset {
  name: string;
  exchange: string;
  exchangeName: string;
  percentage: unknown;
  percentageInvalid?: boolean;
}

function createTestAsset(percentage: unknown): TestAsset {
  return {
    name: 'TestCoin',
    exchange: 'test-exchange',
    exchangeName: 'Test Exchange',
    percentage
  };
}

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
            percentage: 5
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

  describe('validatePercentage', () => {
    let assetList: AssetList;

    beforeEach(() => {
      const container = createTestContainer();
      assetList = container.get(AssetList);
    });

    it('should accept valid percentage values', () => {
      const testCases = [
        { input: 5, expected: false, description: 'integer value' },
        { input: 5.5, expected: false, description: 'decimal value' },
        { input: 0.1, expected: false, description: 'small decimal' },
        { input: 100, expected: false, description: 'maximum value' },
        { input: 1, expected: false, description: 'minimum valid value' },
        { input: 50.75, expected: false, description: 'mid-range decimal' }
      ];

      testCases.forEach(({ input, expected }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(expected);
        expect(asset.percentage).toBe(input); // Value should remain unchanged
      });
    });

    it('should invalidate zero and negative values', () => {
      const testCases = [
        { input: 0, description: 'zero value' },
        { input: -1, description: 'negative integer' },
        { input: -0.5, description: 'negative decimal' },
        { input: -100, description: 'large negative value' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(true);
        expect(asset.percentage).toBe(input); // Value should remain unchanged
      });
    });

    it('should invalidate values greater than 100', () => {
      const testCases = [
        { input: 100.1, description: 'slightly over 100' },
        { input: 101, description: 'just over 100' },
        { input: 200, description: 'double the maximum' },
        { input: 999.99, description: 'very large value' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(true);
        expect(asset.percentage).toBe(input); // Value should remain unchanged
      });
    });

    it('should parse and validate properly formatted string inputs', () => {
      const testCases = [
        { input: '5', invalid: false, description: 'valid string integer' },
        { input: '5.5', invalid: false, description: 'valid string decimal' },
        { input: '100', invalid: false, description: 'valid string at max' },
        { input: '0.1', invalid: false, description: 'valid small decimal' },
        { input: ' 5.5 ', invalid: false, description: 'valid with whitespace (trimmed)' },
        { input: '0', invalid: true, description: 'string zero (invalid range)' },
        { input: '-5', invalid: true, description: 'negative string (invalid range)' },
        { input: '101', invalid: true, description: 'string over max (invalid range)' }
      ];

      testCases.forEach(({ input, invalid }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentage).toBe(input); // Original string value should remain unchanged
        expect(asset.percentageInvalid).toBe(invalid);
      });
    });

    it('should invalidate improperly formatted string inputs', () => {
      const testCases = [
        { input: 'abc', description: 'alphabetic string' },
        { input: '', description: 'empty string' },
        { input: '5.5.5', description: 'multiple decimal points' },
        { input: '5%', description: 'string with percentage symbol' },
        { input: 'NaN', description: 'string "NaN"' },
        { input: 'Infinity', description: 'string "Infinity"' },
        { input: '  ', description: 'whitespace only' },
        { input: '5..5', description: 'double decimal points' },
        { input: '5.', description: 'trailing decimal point' },
        { input: '1.', description: 'trailing decimal point on integer' },
        { input: '4.', description: 'trailing decimal point on digit' },
        { input: '.', description: 'decimal point only' },
        { input: '5a', description: 'number with letter suffix' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(true);
        expect(asset.percentage).toBe(input); // Original value should remain unchanged
      });
    });

    it('should accept properly formatted decimal inputs', () => {
      const testCases = [
        { input: '.5', description: 'decimal starting with point' },
        { input: '.25', description: 'decimal starting with point, two places' },
        { input: '.999', description: 'decimal starting with point, three places' },
        { input: '4.5', description: 'number with one decimal place' },
        { input: '4.44', description: 'number with two decimal places' },
        { input: '50.555', description: 'number with three decimal places' },
        { input: '95.123456', description: 'number with many decimal places' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(false);
        expect(asset.percentage).toBe(input); // Original value should remain unchanged
      });
    });

    it('should validate format correctly regardless of numeric range', () => {
      // These test format validation specifically, separate from range validation
      const validFormatCases = [
        { input: '200.5', description: 'valid format but over range' },
        { input: '.1', description: 'valid format but under range (if min > 0.1)' },
        { input: '0.5', description: 'valid format but might be under range' }
      ];

      validFormatCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        // These should not fail on format, but might fail on range
        const parsedValue = Number.parseFloat(input);
        const expectedInvalid = isNaN(parsedValue) || parsedValue <= 0 || parsedValue > 100;
        expect(asset.percentageInvalid).toBe(expectedInvalid);
      });
    });

    it('should invalidate null and undefined values', () => {
      const testCases = [
        { input: null, description: 'null value' },
        { input: undefined, description: 'undefined value' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(true);
        expect(asset.percentage).toBe(input); // Original value should remain unchanged
      });
    });

    it('should invalidate special numeric values', () => {
      const testCases = [
        { input: NaN, description: 'NaN value' },
        { input: Infinity, description: 'Infinity value' },
        { input: -Infinity, description: '-Infinity value' }
      ];

      testCases.forEach(({ input }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(true);
        expect(asset.percentage).toBe(input); // Original value should remain unchanged (even if NaN)
      });
    });

    it('should handle edge cases around boundaries', () => {
      const testCases = [
        { input: 0.000001, expected: false, description: 'very small positive value' },
        { input: 99.999999, expected: false, description: 'just under 100' },
        { input: 100.000001, expected: true, description: 'just over 100' },
        { input: -0.000001, expected: true, description: 'very small negative value' }
      ];

      testCases.forEach(({ input, expected }) => {
        const asset = createTestAsset(input);
        assetList.validatePercentage(asset as never);
        expect(asset.percentageInvalid).toBe(expected);
        expect(asset.percentage).toBe(input); // Value should remain unchanged
      });
    });
  });
});
