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
