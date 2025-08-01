# Frontend Architecture Guide

## Overview

The batch-take-profit frontend is built using the Aurelia framework with TypeScript, implementing a clean separation of concerns through the View/ViewModel/Store/Service pattern. This architecture ensures maintainability, testability, and scalability while handling the complexities of cryptocurrency exchange integrations.

## Core Architectural Patterns

### 1. View/ViewModel Pattern

**Views (.html)**
- Pure presentation layer using Aurelia's binding syntax
- No business logic - only display logic and formatting
- Bind to ViewModel properties using `${property}` and `property.bind`
- Handle user interactions through ViewModel methods

**ViewModels (.ts)**
- UI controllers that orchestrate user interactions
- Inject and coordinate Stores for data operations
- Expose observable properties for View binding
- Handle component lifecycle (attached, detached, etc.)

```typescript
@inject(AssetStore, OrdersStore, RequestQueueService)
export class SellComponent {
  public assets: IAsset[] = [];
  
  public async attached() {
    await this.refreshData();
  }
}
```

### 2. Store Pattern

Stores act as centralized state managers and business logic coordinators:

**AssetStore**
- Manages cryptocurrency asset state
- Coordinates balance updates and price fetching
- Caches asset data to minimize API calls

**OrdersStore** 
- Tracks order lifecycle and status
- Manages order history and active orders
- Handles order validation and error states

**CoinsStore**
- Manages supported cryptocurrency metadata
- Provides coin-specific formatting and validation

```typescript
@injectable()
export class AssetStore {
  private assets: IAsset[] = [];
  
  public async refreshBalances(): Promise<void> {
    // Coordinate with services to update state
  }
}
```

### 3. Service Layer

Services handle external integrations and data access:

**AssetExchangeApiService**
- Primary interface to butterfly-services backend
- Handles authentication and request formatting
- Provides typed methods for all API operations

**RequestQueueService**
- Serializes all API requests to prevent race conditions
- Critical for handling exchange nonce requirements
- Implements retry logic for failed requests

**LogService**
- Centralized logging with different severity levels
- Configurable output destinations

```typescript
@injectable()
export class RequestQueueService {
  public async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    // Serialize requests to prevent nonce conflicts
  }
}
```

## Key Technical Decisions

### Request Serialization

**Problem**: Cryptocurrency exchanges require strictly sequential request ordering (nonce values).

**Solution**: All API calls are queued through `RequestQueueService`:

```typescript
// Instead of direct API calls
const balance = await this.apiService.getBalance(asset);

// All calls go through the queue
const balance = await this.queueService.enqueue(() => 
  this.apiService.getBalance(asset)
);
```

### Error Handling Strategy

**Retry Logic**: Recursive retry for nonce errors with intelligent backoff
**User Feedback**: Alert-based notifications for operation results
**Graceful Degradation**: Application continues functioning even with partial API failures

### State Management

**Reactive Updates**: Stores expose observable properties that automatically update Views
**Caching Strategy**: Intelligent caching to balance performance with data freshness
**Optimistic Updates**: UI updates immediately with server confirmation

## Component Architecture

### SellComponent
The main trading interface implementing the complete order creation workflow:

```typescript
class SellComponent {
  // Data binding properties
  public assets: IAsset[] = [];
  public selectedOrders: IAsset[] = [];
  public limitOrder: boolean = false;
  
  // User interaction handlers
  public async createSellOrders(): Promise<void>
  public async refresh(): Promise<void>
  public validatePercentage(asset: IAsset): void
}
```

### TradingGrid
Asset management and portfolio overview component with real-time updates.

### OrdersDisplay
Order history and status tracking with filtering and search capabilities.

## Integration Patterns

### Backend Communication

All backend communication flows through the request queue:

```typescript
// Asset balance updates
await this.queueService.enqueue(() => 
  this.apiService.getBalance(asset.exchange, asset.name)
);

// Order placement
await this.queueService.enqueue(() =>
  this.apiService.createOrder(orderRequest)
);

// Price fetching
await this.queueService.enqueue(() =>
  this.apiService.getCurrentPrice(asset.exchange, asset.name)
);
```

### Configuration Management

Environment-specific configuration through JSON files:
- `config.json` - Default settings
- `config.local.json` - Local overrides (gitignored)

### Dependency Injection

Aurelia's built-in DI container manages all dependencies:

```typescript
@inject(AssetStore, OrdersStore, RequestQueueService, LogService)
export class ComponentName {
  constructor(
    private assetStore: AssetStore,
    private ordersStore: OrdersStore,
    private queueService: RequestQueueService,
    private logger: LogService
  ) {}
}
```

## Performance Considerations

### Request Optimization
- Batch operations where possible
- Intelligent caching to reduce API calls
- Request deduplication for identical operations

### UI Responsiveness
- Asynchronous operations with loading indicators
- Optimistic UI updates for immediate feedback
- Background refresh without blocking user interactions

### Memory Management
- Proper cleanup in component detached lifecycle
- Efficient data structures for large asset lists
- Garbage collection friendly patterns

## Testing Strategy

### Unit Tests
- Store logic testing with mocked services
- Component behavior testing with Aurelia testing utilities
- Service integration testing with mock backends

### Integration Tests
- End-to-end workflow testing
- Backend API integration verification
- Request queue behavior validation

## Security Considerations

### API Security
- All sensitive operations handled by backend
- No API keys or secrets in frontend code
- Request validation and sanitization

### Data Protection
- Sensitive data never logged or cached locally
- Secure communication with backend over HTTPS
- User session management through backend

## Future Architecture Considerations

### Scalability
- Component lazy loading for large applications
- State management optimization for complex workflows
- Background task management for long-running operations

### Extensibility
- Plugin architecture for additional exchanges
- Modular component design for feature expansion
- Configurable workflow customization

### Monitoring
- Performance metrics collection
- Error tracking and reporting
- User interaction analytics
