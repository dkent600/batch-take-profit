# PowerShell Commands for Butterfly App Development

## Build & Development Commands

### Clean Build
```powershell
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
npm run build
```

### Development Server
```powershell
npm run dev
```

### Performance Monitoring
```powershell
# Check VS Code memory usage
Get-Process Code | Measure-Object WorkingSet64 -Sum | Select-Object @{Name="Total Memory (MB)"; Expression={[math]::Round($_.Sum / 1MB, 2)}}, Count

# Project file analysis
$tsFiles = Get-ChildItem src -Recurse -Filter "*.ts"
Write-Host "TypeScript Files: $($tsFiles.Count)" -ForegroundColor Green

# Node modules size
if (Test-Path "node_modules") {
    $nodeSize = (Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Node Modules: $([math]::Round($nodeSize, 2)) MB" -ForegroundColor Yellow
}
```

## Code Quality Commands

### TypeScript Check
```powershell
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) { 
    Write-Host "✅ TypeScript check passed!" -ForegroundColor Green 
} else { 
    Write-Host "❌ TypeScript errors found!" -ForegroundColor Red 
}
```

### Lint Check
```powershell
npm run lint
```

### Test Commands
```powershell
npm test
npm run test:watch
```

## Git Commands (PowerShell)

### Status Check
```powershell
git status --porcelain | ForEach-Object { 
    $status = $_.Substring(0,2)
    $file = $_.Substring(3)
    Write-Host "$status $file" -ForegroundColor $(if ($status -match "M") { "Yellow" } elseif ($status -match "A") { "Green" } else { "Red" })
}
```

### Commit with Message
```powershell
git add -A
git commit -m "feat: optimize RequestQueueService performance"
```

## Performance Optimization

### Clean Cache
```powershell
# Clear npm cache
npm cache clean --force

# Clear node_modules and reinstall
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" }
npm install
```

### VS Code Performance
```powershell
# Find large files that might slow VS Code
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB } | Sort-Object Length -Descending | Select-Object Name, @{Name="Size (MB)"; Expression={[math]::Round($_.Length / 1MB, 2)}}
```

## Request Queue Service Debugging

### Enable Logging
```powershell
# Edit request-queue-service.ts to enable logging
(Get-Content src/services/request-queue-service.ts) -replace 'enableLogging = false', 'enableLogging = true' | Set-Content src/services/request-queue-service.ts
```

### Disable Logging
```powershell
# Edit request-queue-service.ts to disable logging
(Get-Content src/services/request-queue-service.ts) -replace 'enableLogging = true', 'enableLogging = false' | Set-Content src/services/request-queue-service.ts
```

### Monitor Request Queue
```powershell
# Watch for queue-related log messages
npm run dev | Select-String "Queue|Request|API"
```

## Package Management

### Update Dependencies
```powershell
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install axios@latest
```

### Audit Security
```powershell
npm audit
npm audit fix
```

## Development Workflow

### Quick Development Cycle
```powershell
# Complete development restart
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful, starting dev server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "❌ Build failed, check errors above" -ForegroundColor Red
}
```

### Code Quality Check
```powershell
# Full quality check pipeline
Write-Host "🔍 Running TypeScript check..." -ForegroundColor Blue
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) { 
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
    
    Write-Host "🔍 Running linter..." -ForegroundColor Blue
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Lint check passed" -ForegroundColor Green
        
        Write-Host "🔍 Running tests..." -ForegroundColor Blue
        npm test
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All checks passed! Ready for commit." -ForegroundColor Green
        }
    }
}
```

## Backend Integration Testing

### Test Backend Connection
```powershell
# Quick API connectivity test
$apiUrl = "http://localhost:3000/api/v1/health"
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is responding: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
}
```

### Monitor API Requests
```powershell
# Enable request logging and monitor
(Get-Content src/services/request-queue-service.ts) -replace 'enableLogging = false', 'enableLogging = true' | Set-Content src/services/request-queue-service.ts
Write-Host "✅ Request logging enabled. Check browser console for API requests." -ForegroundColor Green
```

## Utility Functions

### Project Health Check
```powershell
function Get-ProjectHealth {
    Write-Host "🏥 Butterfly App Frontend Health Check" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    
    # Check Node.js version
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor $(if ($nodeVersion -match "v1[89]|v[2-9][0-9]") { "Green" } else { "Yellow" })
    
    # Check npm version
    $npmVersion = npm --version
    Write-Host "npm: $npmVersion" -ForegroundColor Green
    
    # Check if backend is running
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/health" -TimeoutSec 2
        Write-Host "Backend: ✅ Connected" -ForegroundColor Green
    } catch {
        Write-Host "Backend: ❌ Not responding" -ForegroundColor Red
    }
    
    # Check build status
    $buildTest = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "TypeScript: ✅ No errors" -ForegroundColor Green
    } else {
        Write-Host "TypeScript: ❌ Has errors" -ForegroundColor Red
    }
    
    # Check dependencies
    if (Test-Path "node_modules") {
        Write-Host "Dependencies: ✅ Installed" -ForegroundColor Green
    } else {
        Write-Host "Dependencies: ❌ Missing (run npm install)" -ForegroundColor Red
    }
}

# Run health check
Get-ProjectHealth
```
# Disable logging for performance
(Get-Content src/services/request-queue-service.ts) -replace 'enableLogging = true', 'enableLogging = false' | Set-Content src/services/request-queue-service.ts
```

## Deployment

### Production Build
```powershell
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "🚀 Production build ready!" -ForegroundColor Green
    Get-ChildItem dist | Format-Table Name, Length, LastWriteTime
}
```
