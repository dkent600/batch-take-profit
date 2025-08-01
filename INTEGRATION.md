# Backend Integration Guide

## Overview

This document describes how the batch-take-profit frontend integrates with the butterfly-services backend API. The integration handles complex cryptocurrency exchange requirements including nonce management, request serialization, and error handling.

## Backend API Integration

### API Base Configuration

The frontend connects to butterfly-services through configurable endpoints:

```json
// config.local.json
{
  "apiBaseUrl": "http://localhost:3000",
  "apiVersion": "v1",
  "timeout": 30000,
  "retryAttempts": 3
}
```

### Authentication Flow

The backend handles all exchange authentication:
1. Frontend sends requests to butterfly-services
2. Backend manages API keys and secrets securely
3. Backend handles exchange-specific authentication requirements
4. Frontend receives authenticated responses

## Request Queue Integration

### Critical Requirement: Nonce Handling

Cryptocurrency exchanges require sequential nonce values for API requests. The frontend implements a sophisticated request queue to ensure proper ordering:

```typescript
@injectable()
export class RequestQueueService {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  
  public async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }
}
```

### Request Serialization Pattern

**All API calls must use the queue service:**

```typescript
// ❌ Wrong - Direct API calls can cause nonce conflicts
const balance = await this.apiService.getBalance(exchange, asset);

// ✅ Correct - Queued requests maintain proper ordering
const balance = await this.queueService.enqueue(() =>
  this.apiService.getBalance(exchange, asset)
);
```

## API Service Layer

### AssetExchangeApiService

Primary service for backend communication:

```typescript
@injectable()
export class AssetExchangeApiService {
  // Asset Management
  async getBalance(exchange: string, asset: string): Promise<number>
  async getCurrentPrice(exchange: string, asset: string): Promise<number>
  
  // Order Management  
  async createMarketOrder(request: ICreateOrderRequest): Promise<IOrderResponse>
  async createLimitOrder(request: ICreateLimitOrderRequest): Promise<IOrderResponse>
  async getOpenOrders(exchange: string): Promise<IOpenedOrderListItem[]>
  async getClosedOrders(exchange: string): Promise<IClosedOrderListItem[]>
  async cancelOrder(exchange: string, orderId: string): Promise<ICancelOrderResponse>
  
  // Health Check
  async checkHealth(): Promise<IHealthResponse>
}
```

### Supported Endpoints

#### Asset Operations
- `GET /api/v1/{exchange}/balance/{asset}` - Get asset balance
- `GET /api/v1/{exchange}/price/{asset}` - Get current price

#### Order Operations
- `POST /api/v1/{exchange}/orders` - Create new order
- `GET /api/v1/{exchange}/orders/open` - List open orders  
- `GET /api/v1/{exchange}/orders/closed` - List order history
- `DELETE /api/v1/{exchange}/orders/{orderId}` - Cancel order

#### System Operations
- `GET /api/v1/health` - Backend health check

## Error Handling Integration

### Nonce Error Recovery

The frontend implements intelligent retry logic for nonce-related errors:

```typescript
private async executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (this.isNonceError(error) && attempt < maxRetries) {
        await this.delay(1000 * attempt); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}

private isNonceError(error: any): boolean {
  return error?.message?.includes('EAPI:Invalid nonce') ||
         error?.response?.data?.message?.includes('nonce');
}
```

### Backend Error Response Format

The backend returns structured error responses:

```typescript
interface IApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
    timestamp: string;
  };
}
```

### Frontend Error Handling

```typescript
try {
  const result = await this.queueService.enqueue(() =>
    this.apiService.createOrder(orderRequest)
  );
  this.showSuccess('Order created successfully');
} catch (error) {
  if (this.isNonceError(error)) {
    // Automatic retry handled by queue service
    this.logger.warn('Nonce error, retrying...');
  } else {
    this.showError(`Order failed: ${error.message}`);
  }
}
```

## Data Models Integration

### Interface Synchronization

The frontend duplicates key interfaces from the backend. **Note**: This is technical debt that should be resolved with a shared package.

```typescript
// Frontend interfaces (should match backend)
interface IAsset {
  name: string;
  exchange: string;
  balance: number;
  currentPrice: number;
  // ... other properties
}

interface IOpenedOrderListItem {
  refid: string;
  userref: number;
  status: string;
  // ... other properties  
}
```

### Data Transformation

The frontend transforms backend responses for UI consumption:

```typescript
private transformAssetData(backendAsset: any): IAsset {
  return {
    name: backendAsset.symbol,
    exchange: backendAsset.exchange,
    balance: parseFloat(backendAsset.balance),
    currentPrice: parseFloat(backendAsset.price),
    // UI-specific properties
    selected: false,
    percentage: 10,
    amount: 0
  };
}
```

## Real-time Data Integration

### Price Updates

Regular price refreshes through queued requests:

```typescript
public async updateAllCurrentPrices(): Promise<void> {
  const promises = this.assets.map(asset =>
    this.queueService.enqueue(() =>
      this.apiService.getCurrentPrice(asset.exchange, asset.name)
    )
  );
  
  const prices = await Promise.all(promises);
  this.updateAssetPrices(prices);
}
```

### Balance Synchronization

Balance updates before critical operations:

```typescript
public async refreshBalancesBeforeOrder(): Promise<void> {
  for (const asset of this.selectedAssets) {
    const balance = await this.queueService.enqueue(() =>
      this.apiService.getBalance(asset.exchange, asset.name)
    );
    asset.balance = balance;
  }
}
```

## Performance Optimization

### Request Batching

Where possible, the frontend batches related operations:

```typescript
// Batch price updates
const pricePromises = assets.map(asset => 
  this.queueService.enqueue(() => 
    this.apiService.getCurrentPrice(asset.exchange, asset.name)
  )
);
const prices = await Promise.all(pricePromises);
```

### Caching Strategy

The frontend implements intelligent caching:

```typescript
private priceCache = new Map<string, {price: number, timestamp: number}>();
private readonly CACHE_DURATION = 30000; // 30 seconds

public async getCachedPrice(exchange: string, asset: string): Promise<number> {
  const key = `${exchange}:${asset}`;
  const cached = this.priceCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
    return cached.price;
  }
  
  const price = await this.queueService.enqueue(() =>
    this.apiService.getCurrentPrice(exchange, asset)
  );
  
  this.priceCache.set(key, { price, timestamp: Date.now() });
  return price;
}
```

## Testing Integration

### Mock Backend Services

For testing, the frontend can use mock services:

```typescript
// Test configuration
{
  "apiBaseUrl": "http://localhost:3001", // Mock server
  "enableMockMode": true
}
```

### Integration Test Patterns

```typescript
describe('Backend Integration', () => {
  it('should handle nonce errors gracefully', async () => {
    // Setup mock to return nonce error on first call
    mockApiService.getBalance.mockRejectedValueOnce(
      new Error('EAPI:Invalid nonce')
    );
    mockApiService.getBalance.mockResolvedValueOnce(100);
    
    // Should retry and succeed
    const balance = await assetService.getBalance('kraken', 'BTC');
    expect(balance).toBe(100);
    expect(mockApiService.getBalance).toHaveBeenCalledTimes(2);
  });
});
```

## Security Considerations

### No Sensitive Data in Frontend

The frontend never handles:
- Exchange API keys or secrets
- Private keys or wallet information
- Sensitive authentication tokens

### Secure Communication

All communication with the backend:
- Uses HTTPS in production
- Includes request validation
- Handles errors without exposing sensitive details

## Troubleshooting Integration Issues

### Common Problems

1. **Nonce Errors**: Ensure only one frontend instance is running
2. **Request Timeouts**: Check backend connectivity and increase timeout
3. **Order Failures**: Verify backend has valid exchange credentials
4. **Price Update Failures**: Check exchange API rate limits

### Debugging Tools

Enable request logging:
```typescript
// In request-queue-service.ts
private readonly enableLogging = true;
```

Monitor backend health:
```typescript
const health = await this.apiService.checkHealth();
console.log('Backend status:', health);
```

### Log Analysis

Key log messages to monitor:
- `RequestQueue: Processing request` - Normal operation
- `RequestQueue: Retry attempt` - Nonce error recovery
- `API Error:` - Backend communication issues
- `Order created:` - Successful operations

## Future Integration Improvements

### Planned Enhancements

1. **Shared Interface Package**: Eliminate interface duplication
2. **WebSocket Integration**: Real-time price feeds
3. **Request Deduplication**: Prevent unnecessary API calls
4. **Circuit Breaker Pattern**: Handle backend outages gracefully
5. **Metrics Collection**: Monitor integration performance
