import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { AssetExchangeApiService } from '../src/services/exchange-apis/exchange-api-service.js';
import { IAssetsConfigService } from '../src/services/assets-config-service.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as MockedFunction<typeof axios> & {
  get: MockedFunction<typeof axios.get>;
  post: MockedFunction<typeof axios.post>;
  delete: MockedFunction<typeof axios.delete>;
};

describe('AssetExchangeApiService', () => {
  let service: AssetExchangeApiService;
  let mockConfigService: IAssetsConfigService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the config service
    mockConfigService = {
      serviceUrl: 'http://localhost:3000',
      logFileName: 'test.log',
      telegramBotToken: 'test-token',
      telegramChatId: 'test-chat',
      getAssets: vi.fn(),
      getAPIKey: vi.fn(),
      getAPISecret: vi.fn(),
    };

    service = new AssetExchangeApiService(mockConfigService);
  });

  describe('isProduction', () => {
    it('should return true when API returns isProduction: true', async () => {
      // Arrange
      const mockResponse = {
        data: {
          isProduction: true,
          timestamp: '2025-08-05T12:00:00.000Z'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');
    });

    it('should return false when API returns isProduction: false', async () => {
      // Arrange
      const mockResponse = {
        data: {
          isProduction: false,
          timestamp: '2025-08-05T12:00:00.000Z'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');
    });

    it('should return false when API returns undefined isProduction (safety fallback)', async () => {
      // Arrange
      const mockResponse = {
        data: {
          timestamp: '2025-08-05T12:00:00.000Z'
          // isProduction is undefined
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');
    });

    it('should return false when API returns null isProduction (safety fallback)', async () => {
      // Arrange
      const mockResponse = {
        data: {
          isProduction: null,
          timestamp: '2025-08-05T12:00:00.000Z'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false and log warning when API call fails (network error)', async () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(networkError);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to check production mode from API, defaulting to false:',
        networkError
      );
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it('should return false and log warning when API returns HTTP error', async () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const httpError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      mockedAxios.get.mockRejectedValue(httpError);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to check production mode from API, defaulting to false:',
        httpError
      );

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it('should use the correct service URL from config service', async () => {
      // Arrange
      mockConfigService.serviceUrl = 'https://production-api.example.com';
      const serviceWithDifferentUrl = new AssetExchangeApiService(mockConfigService);

      const mockResponse = {
        data: {
          isProduction: true,
          timestamp: '2025-08-05T12:00:00.000Z'
        }
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      await serviceWithDifferentUrl.isProduction();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith('https://production-api.example.com/api/v1/production-mode');
    });

    it('should handle malformed response data gracefully', async () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const mockResponse = {
        data: null // Malformed response
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false); // Should default to false due to nullish coalescing
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');

      // Cleanup
      consoleWarnSpy.mockRestore();
    });

    it('should handle response without data property', async () => {
      // Arrange
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const mockResponse = {}; // No data property
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Act
      const result = await service.isProduction();

      // Assert
      expect(result).toBe(false); // Should default to false
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/v1/production-mode');

      // Cleanup
      consoleWarnSpy.mockRestore();
    });
  });
});
