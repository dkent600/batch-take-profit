# Configuration Guide

## Overview

The batch-take-profit application uses a two-file configuration system:
- **config.json** - Public configuration for assets and backend URL (tracked in version control)
- **config.local.json** - Private configuration for API keys and secrets (not tracked in git)

## Configuration Files

### config.json (Public Configuration)

Contains the backend service URL and asset definitions. This file is tracked in version control.

**Structure:**
```json
{
  "batchConfig": {
    "serviceUrl": "http://localhost:3000",
    "exchanges": [
      {
        "name": "MexC"
      },
      {
        "name": "Kraken"
      },
      {
        "name": "CoinEx"
      }
    ],
    "assets": [
      {
        "name": "SOL",
        "percentage": 15,
        "exchange": "Kraken"
      },
      {
        "name": "DOGE",
        "percentage": 15,
        "exchange": "Kraken"
      }
    ]
  }
}
```

**Configuration Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `batchConfig.serviceUrl` | string | Yes | Backend API base URL (butterfly-services endpoint) |
| `batchConfig.exchanges` | array | Yes | List of exchange definitions |
| `batchConfig.exchanges[].name` | string | Yes | Exchange name (e.g., "Kraken", "MexC", "CoinEx") |
| `batchConfig.assets` | array | Yes | List of assets to manage |
| `batchConfig.assets[].name` | string | Yes | Asset/coin symbol (e.g., "SOL", "DOGE") |
| `batchConfig.assets[].exchange` | string | Yes | Exchange where the asset is traded |
| `batchConfig.assets[].percentage` | number | Yes | Default percentage for take-profit orders |

### config.local.json (Private Configuration)

Contains sensitive information like API keys, secrets, and Telegram credentials. **This file must NOT be committed to version control.**

**Structure:**
```json
{
  "mexc": {
    "apiKey": "your-mexc-api-key",
    "apiSecret": "your-mexc-api-secret"
  },
  "kraken": {
    "apiKey": "your-kraken-api-key",
    "apiSecret": "your-kraken-api-secret"
  },
  "coinex": {
    "apiKey": "your-coinex-api-key",
    "apiSecret": "your-coinex-api-secret"
  },
  "telegram": {
    "botToken": "your-telegram-bot-token",
    "chatId": "your-telegram-chat-id"
  }
}
```

**Configuration Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `{exchange}.apiKey` | string | Yes | Exchange API key (lowercase exchange name) |
| `{exchange}.apiSecret` | string | Yes | Exchange API secret |
| `telegram.botToken` | string | Optional | Telegram bot token for notifications |
| `telegram.chatId` | string | Optional | Telegram chat ID for notifications |

## Environment Setup

### Initial Setup

1. **Create local configuration file:**
   ```bash
   # Create config.local.json from template
   New-Item config.local.json -ItemType File
   ```

2. **Add your credentials to config.local.json:**
   ```json
   {
     "kraken": {
       "apiKey": "your-actual-api-key",
       "apiSecret": "your-actual-api-secret"
     },
     "telegram": {
       "botToken": "your-bot-token",
       "chatId": "your-chat-id"
     }
   }
   ```

3. **Configure assets in config.json:**
   - Add your trading assets to the `assets` array
   - Set the appropriate `percentage` for each asset
   - Match the `exchange` field to one of your configured exchanges

4. **Update backend URL:**
   - For local development, use `http://localhost:3000`
   - For production, update `serviceUrl` to your deployed backend

### Development Environment

**config.json:**
```json
{
  "batchConfig": {
    "serviceUrl": "http://localhost:3000",
    "exchanges": [
      {"name": "Kraken"}
    ],
    "assets": [
      {
        "name": "SOL",
        "percentage": 15,
        "exchange": "Kraken"
      }
    ]
  }
}
```

**config.local.json:**
```json
{
  "kraken": {
    "apiKey": "dev-api-key",
    "apiSecret": "dev-api-secret"
  },
  "telegram": {
    "botToken": "dev-bot-token",
    "chatId": "dev-chat-id"
  }
}
```

### Production Environment

**config.json:**
```json
{
  "batchConfig": {
    "serviceUrl": "https://api.butterfly-services.com",
    "exchanges": [
      {"name": "Kraken"},
      {"name": "MexC"},
      {"name": "CoinEx"}
    ],
    "assets": [
      {
        "name": "SOL",
        "percentage": 10,
        "exchange": "Kraken"
      },
      {
        "name": "DOGE",
        "percentage": 15,
        "exchange": "Kraken"
      }
    ]
  }
}
```

**config.local.json:**
```json
{
  "kraken": {
    "apiKey": "prod-kraken-api-key",
    "apiSecret": "prod-kraken-api-secret"
  },
  "mexc": {
    "apiKey": "prod-mexc-api-key",
    "apiSecret": "prod-mexc-api-secret"
  },
  "coinex": {
    "apiKey": "prod-coinex-api-key",
    "apiSecret": "prod-coinex-api-secret"
  },
  "telegram": {
    "botToken": "prod-bot-token",
    "chatId": "prod-chat-id"
  }
}
```

## How Configuration is Used

### AssetsConfigService

The `AssetsConfigService` loads `config.json` to:
- Retrieve the backend API URL (`serviceUrl`)
- Load asset configurations (name, exchange, percentage)
- Access exchange definitions

### EnvService

The `EnvService` loads `config.local.json` to:
- Retrieve exchange API credentials
- Access Telegram bot credentials
- Support dot-notation access (e.g., `envService.get('kraken.apiKey')`)

### Configuration Flow

1. Application starts and initializes `EnvService`
2. `EnvService` fetches and loads `config.local.json`
3. `AssetsConfigService` is injected with `EnvService`
4. `AssetsConfigService` fetches and loads `config.json`
5. Services access credentials via `envService.get('exchange.apiKey')`
6. Services access public config via `assetsConfigService.serviceUrl` and `getAssets()`

## Security Considerations

### Protecting Sensitive Information

**CRITICAL: Never commit `config.local.json` to version control!**

The `.gitignore` file should always include:
```
config.local.json
```

**What goes in each file:**

✅ **config.json** (safe to commit):
- Backend service URL
- Asset configurations
- Exchange names
- Public settings

❌ **config.local.json** (NEVER commit):
- API keys
- API secrets
- Telegram bot tokens
- Any credentials or sensitive data

### Credential Redaction

The `AssetsConfigService` includes error redaction to prevent credentials from appearing in logs:

```typescript
error.message = error.message
  .replace(this.apiKey || '', '[REDACTED_API_KEY]')
  .replace(this.apiSecret || '', '[REDACTED_API_SECRET]')
  .replace(this.telegramBotToken || '', '[REDACTED_BOT_TOKEN]');
```

### File Permissions

For production deployments on Linux/Mac:
```bash
# Make config.local.json readable only by owner
chmod 600 config.local.json

# Public config can be world-readable
chmod 644 config.json
```

On Windows (PowerShell):
```powershell
# Remove inheritance and grant only current user access
icacls config.local.json /inheritance:r /grant:r "$env:USERNAME:(F)"
```

## Troubleshooting

### Common Issues

#### "Local config not found" Warning

**Symptom:** Warning message in console: "Local config not found, falling back to public config"

**Cause:** `config.local.json` file doesn't exist or isn't accessible.

**Solution:**
1. Create `config.local.json` in the project root
2. Add your exchange API credentials
3. Ensure file is in the same directory as `config.json`

#### Assets Not Loading

**Symptom:** Empty asset list or "Error fetching config" message

**Cause:** `config.json` is malformed or missing required fields.

**Solution:**
1. Validate JSON syntax: `npx jsonlint config.json`
2. Ensure `batchConfig` object exists
3. Verify `assets` array is present and properly formatted
4. Check that each asset has `name`, `exchange`, and `percentage`

#### API Connection Failures

**Symptom:** "Failed to fetch" or network errors when accessing backend

**Cause:** Incorrect `serviceUrl` or backend not running.

**Solution:**
1. Verify `batchConfig.serviceUrl` in `config.json`
2. Ensure butterfly-services backend is running
3. Test URL manually: `curl http://localhost:3000/api/v1/production-mode`
4. Check for CORS issues if running on different ports

#### Missing Exchange Credentials

**Symptom:** API calls fail with authentication errors

**Cause:** Exchange credentials not configured in `config.local.json`

**Solution:**
1. Open `config.local.json`
2. Add section for each exchange (use lowercase name):
   ```json
   {
     "kraken": {
       "apiKey": "your-key",
       "apiSecret": "your-secret"
     }
   }
   ```
3. Ensure exchange name matches exactly (case-insensitive in code)

### Configuration Validation

Before running the application, verify your configuration:

**Check config.json structure:**
```powershell
Get-Content config.json | ConvertFrom-Json | Select-Object -ExpandProperty batchConfig
```

**Verify config.local.json exists (without revealing contents):**
```powershell
Test-Path config.local.json
```

**Test backend connectivity:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/production-mode"
```

## Best Practices

### Development Workflow

1. **Never hardcode credentials** - Always use `config.local.json`
2. **Keep config.json minimal** - Only include public, non-sensitive data
3. **Document asset changes** - Comment why assets are added/removed
4. **Test locally first** - Verify configuration before deploying

### Adding New Assets

1. Add asset to `config.json`:
   ```json
   {
     "name": "BTC",
     "percentage": 10,
     "exchange": "Kraken"
   }
   ```

2. Ensure exchange credentials exist in `config.local.json`

3. Verify exchange is listed in `batchConfig.exchanges` array

4. Restart application to load new configuration

### Adding New Exchanges

1. Add exchange to `config.json`:
   ```json
   {
     "exchanges": [
       {"name": "Binance"}
     ]
   }
   ```

2. Add credentials to `config.local.json`:
   ```json
   {
     "binance": {
       "apiKey": "your-key",
       "apiSecret": "your-secret"
     }
   }
   ```

3. Verify butterfly-services backend supports the exchange

### Configuration Backup

**Backup your local configuration** (while keeping it secure):

```powershell
# Create encrypted backup (Windows)
Copy-Item config.local.json config.local.backup.json
Compress-Archive -Path config.local.backup.json -DestinationPath config-backup-$(Get-Date -Format 'yyyy-MM-dd').zip -CompressionLevel Optimal
Remove-Item config.local.backup.json
```

**Never store backups in:**
- Cloud services (Dropbox, Google Drive, etc.)
- Email
- Unencrypted USB drives
- Version control systems

## TypeScript Interface Reference

The configuration interfaces used in the codebase:

```typescript
// From assets-config-service.ts
interface IAsset {
  name: string;
  exchange: string;
  percentage: number;
  currentPrice: number;
  amount?: number;
  balance?: number;
  limitPrice?: number;
}

interface IExchange {
  name: string;
}

interface IAssetConfig {
  name: string;
  exchange: string;
  percentage?: number;
}

interface IBatchConfig {
  serviceUrl?: string;
  exchanges?: IExchange[];
  assets?: IAssetConfig[];
}
```

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Application architecture and services
- [INTEGRATION.md](INTEGRATION.md) - Backend API integration details
- [butterfly-services README](../../butterfly-services/README.md) - Backend service documentation
