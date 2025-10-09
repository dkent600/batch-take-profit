# Configuration Guide

## Overview

The batch-take-profit frontend uses a JSON-based configuration system that supports environment-specific overrides. This guide covers all configuration options and setup procedures.

## Configuration Files

### config.json (Default Configuration)
The main configuration file tracked in version control:

```json
{
  "apiBaseUrl": "http://localhost:3000",
  "apiVersion": "v1",
  "requestTimeout": 30000,
  "retryAttempts": 3,
  "retryDelayMs": 1000,
  "enableRequestLogging": false,
  "priceUpdateInterval": 30000,
  "balanceRefreshInterval": 60000,
  "maxConcurrentRequests": 1,
  "uiSettings": {
    "defaultPercentage": 10,
    "theme": "forest",
    "enableAnimations": true,
    "autoRefreshPrices": true
  }
}
```

### config.local.json (Local Overrides)
Environment-specific configuration (not tracked in git):

```json
{
  "apiBaseUrl": "https://api.butterfly-services.example.com",
  "enableRequestLogging": true,
  "uiSettings": {
    "defaultPercentage": 25
  }
}
```

## Configuration Options Reference

### API Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBaseUrl` | string | `"http://localhost:3000"` | Backend API base URL |
| `apiVersion` | string | `"v1"` | API version for endpoint construction |
| `requestTimeout` | number | `30000` | Request timeout in milliseconds |
| `retryAttempts` | number | `3` | Maximum retry attempts for failed requests |
| `retryDelayMs` | number | `1000` | Base delay between retries (exponential backoff) |

### Request Queue Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxConcurrentRequests` | number | `1` | Max concurrent API requests (keep at 1 for nonce safety) |
| `enableRequestLogging` | boolean | `false` | Enable detailed request/response logging |

### Data Refresh Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `priceUpdateInterval` | number | `30000` | Automatic price update interval (ms) |
| `balanceRefreshInterval` | number | `60000` | Balance refresh interval (ms) |
| `cacheExpirationMs` | number | `30000` | Price cache expiration time |

### UI Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `uiSettings.defaultPercentage` | number | `10` | Default percentage for take-profit orders |
| `uiSettings.theme` | string | `"forest"` | DaisyUI theme name |
| `uiSettings.enableAnimations` | boolean | `true` | Enable UI animations |
| `uiSettings.autoRefreshPrices` | boolean | `true` | Automatically refresh prices |

## Environment Setup

### Development Environment

1. **Copy default configuration**:
   ```bash
   cp config.json config.local.json
   ```

2. **Update backend URL**:
   ```json
   {
     "apiBaseUrl": "http://localhost:3000",
     "enableRequestLogging": true
   }
   ```

3. **Verify backend connectivity**:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

### Staging Environment

For staging deployment:

```json
{
  "apiBaseUrl": "https://staging-api.butterfly-services.com",
  "requestTimeout": 60000,
  "retryAttempts": 5,
  "enableRequestLogging": false,
  "uiSettings": {
    "theme": "business"
  }
}
```

### Production Environment

Production configuration template:

```json
{
  "apiBaseUrl": "https://api.butterfly-services.com",
  "requestTimeout": 45000,
  "retryAttempts": 3,
  "retryDelayMs": 2000,
  "enableRequestLogging": false,
  "priceUpdateInterval": 60000,
  "balanceRefreshInterval": 120000,
  "uiSettings": {
    "defaultPercentage": 5,
    "theme": "corporate",
    "enableAnimations": false,
    "autoRefreshPrices": true
  }
}
```

## Advanced Configuration

### Custom Retry Logic

Configure exponential backoff for API retries:

```json
{
  "retryAttempts": 5,
  "retryDelayMs": 1000,
  "retryMultiplier": 2,
  "maxRetryDelayMs": 30000
}
```

### Performance Tuning

For high-performance requirements:

```json
{
  "priceUpdateInterval": 15000,
  "balanceRefreshInterval": 30000,
  "cacheExpirationMs": 15000,
  "requestTimeout": 20000,
  "uiSettings": {
    "enableAnimations": false
  }
}
```

### Debug Configuration

For troubleshooting and development:

```json
{
  "enableRequestLogging": true,
  "requestTimeout": 120000,
  "retryAttempts": 1,
  "logLevel": "debug",
  "uiSettings": {
    "showDebugInfo": true
  }
}
```

## Configuration Loading

### Load Order

Configuration is loaded in this priority order:
1. `config.local.json` (highest priority)
2. `config.json` (default values)

### TypeScript Interface

The configuration is typed for safety:

```typescript
interface AppConfig {
  apiBaseUrl: string;
  apiVersion: string;
  requestTimeout: number;
  retryAttempts: number;
  retryDelayMs: number;
  enableRequestLogging: boolean;
  priceUpdateInterval: number;
  balanceRefreshInterval: number;
  maxConcurrentRequests: number;
  uiSettings: {
    defaultPercentage: number;
    theme: string;
    enableAnimations: boolean;
    autoRefreshPrices: boolean;
  };
}
```

### Configuration Service

Access configuration through the ConfigService:

```typescript
@injectable()
export class ConfigService {
  private config: AppConfig;
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    // Load and merge config files
    const defaultConfig = require('../config.json');
    let localConfig = {};
    
    try {
      localConfig = require('../config.local.json');
    } catch {
      // config.local.json is optional
    }
    
    this.config = { ...defaultConfig, ...localConfig };
  }
  
  public get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.config[key];
  }
}
```

## Security Considerations

### Sensitive Information

**Never include in configuration files**:
- API keys or secrets
- Database passwords
- Private keys
- Personal information

### File Permissions

Ensure appropriate file permissions:
```bash
# Development
chmod 644 config.json
chmod 600 config.local.json

# Production
chmod 400 config.local.json
```

### Environment Variables Override

For container deployments, support environment variable overrides:

```typescript
private loadConfig(): void {
  const config = { ...defaultConfig, ...localConfig };
  
  // Override with environment variables
  if (process.env.API_BASE_URL) {
    config.apiBaseUrl = process.env.API_BASE_URL;
  }
  
  if (process.env.REQUEST_TIMEOUT) {
    config.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT);
  }
  
  this.config = config;
}
```

## Troubleshooting Configuration

### Common Issues

#### Configuration Not Loading
- Verify JSON syntax with `npx jsonlint config.local.json`
- Check file permissions and accessibility
- Ensure file is in the correct directory

#### API Connection Failures
- Verify `apiBaseUrl` is correct and accessible
- Check network connectivity to backend
- Validate SSL certificates for HTTPS URLs

#### Performance Issues
- Reduce `priceUpdateInterval` and `balanceRefreshInterval`
- Increase `requestTimeout` for slow networks
- Disable `enableAnimations` for better performance

### Validation

Validate configuration at startup:

```typescript
public validateConfig(): void {
  const required = ['apiBaseUrl', 'apiVersion'];
  
  for (const key of required) {
    if (!this.config[key]) {
      throw new Error(`Required configuration missing: ${key}`);
    }
  }
  
  if (this.config.retryAttempts < 0) {
    throw new Error('retryAttempts must be >= 0');
  }
  
  if (!this.isValidUrl(this.config.apiBaseUrl)) {
    throw new Error('apiBaseUrl must be a valid URL');
  }
}
```

### Configuration Testing

Test configuration in different environments:

```typescript
describe('Configuration', () => {
  it('should load default configuration', () => {
    const config = new ConfigService();
    expect(config.get('apiBaseUrl')).toBeDefined();
  });
  
  it('should override with local configuration', () => {
    // Mock config.local.json
    const config = new ConfigService();
    expect(config.get('enableRequestLogging')).toBe(true);
  });
});
```

## Best Practices

### Development
- Always use `config.local.json` for local overrides
- Enable request logging during development
- Use shorter intervals for faster feedback

### Production
- Minimize logging overhead
- Use appropriate timeouts for network conditions
- Monitor configuration impact on performance

### Maintenance
- Document configuration changes
- Version control `config.json` changes
- Regular security review of accessible configurations
