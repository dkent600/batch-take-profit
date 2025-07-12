import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { EnvService } from '../src/services/env-service.js';

// Mock fetch globally
global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockedFetch = fetch as MockedFunction<typeof fetch>;

describe('EnvService', () => {
  let envService: EnvService;

  beforeEach(() => {
    envService = new EnvService();
    vi.clearAllMocks();
  });

  describe('get method with real config', () => {
    beforeEach(async () => {
      const mockConfig = {
        mexc: {
          apiKey: 'test-mexc-key',
          apiSecret: 'test-mexc-secret'
        },
        coinex: {
          apiKey: 'test-coinex-key',
          apiSecret: 'test-coinex-secret'
        },
        telegram: {
          botToken: 'test-bot-token',
          chatId: '12345'
        },
        logging: {
          filename: 'test.log'
        },
        simple: 'simple-value',
        number: 42,
        boolean: true
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig)
      } as Response);

      await envService.init();
    });

    it('should get simple string values', () => {
      expect(envService.get('simple')).toBe('simple-value');
    });

    it('should get nested values with dot notation', () => {
      expect(envService.get('mexc.apiKey')).toBe('test-mexc-key');
      expect(envService.get('mexc.apiSecret')).toBe('test-mexc-secret');
      expect(envService.get('coinex.apiKey')).toBe('test-coinex-key');
      expect(envService.get('telegram.botToken')).toBe('test-bot-token');
      expect(envService.get('telegram.chatId')).toBe('12345');
      expect(envService.get('logging.filename')).toBe('test.log');
    });

    it('should return undefined for non-existent keys', () => {
      expect(envService.get('nonexistent')).toBeUndefined();
      expect(envService.get('mexc.nonexistent')).toBeUndefined();
      expect(envService.get('nonexistent.key')).toBeUndefined();
    });

    it('should handle number values', () => {
      expect(envService.get('number')).toBe('42');
    });

    it('should handle boolean values', () => {
      expect(envService.get('boolean')).toBe('true');
    });
  });

  describe('getNumber method', () => {
    beforeEach(async () => {
      const mockConfig = {
        number: '42',
        float: '3.14',
        string: 'not-a-number',
        zero: '0'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig)
      } as Response);

      await envService.init();
    });

    it('should parse integer strings', () => {
      expect(envService.getNumber('number')).toBe(42);
    });

    it('should parse float strings', () => {
      expect(envService.getNumber('float')).toBe(3.14);
    });

    it('should return undefined for non-numeric strings', () => {
      expect(envService.getNumber('string')).toBeUndefined();
    });

    it('should handle zero', () => {
      expect(envService.getNumber('zero')).toBe(0);
    });
  });

  describe('before init is called', () => {
    it('should return undefined for all get calls before init', () => {
      const uninitializedService = new EnvService();

      expect(uninitializedService.get('mexc.apiKey')).toBeUndefined();
      expect(uninitializedService.getNumber('number')).toBeUndefined();
      expect(uninitializedService.getBoolean('boolean')).toBeUndefined();
    });
  });
});
