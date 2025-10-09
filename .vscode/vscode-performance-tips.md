# VS Code Performance Optimization Tips

## Additional Performance Recommendations

### 2. VS Code Settings Optimization
```json
{
  // Disable unused features
  "git.autoRepositoryDetection": false,
  "extensions.autoUpdate": false,
  
  // Reduce file watching
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/**": true
  },
  
  // Optimize TypeScript
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  
  // Reduce CPU usage
  "editor.semanticHighlighting.enabled": false,
  "editor.hover.delay": 1000
}
```

### 3. Extension Management
- Disable unused extensions
- Check for extension memory leaks
- Consider workspace-specific extension profiles

### 4. Workspace Structure
- Keep node_modules in .gitignore and file exclusions
- Consider splitting large workspaces
- Use workspace-specific settings

### 5. System Resources
Current VS Code processes: 18 (4.5GB total memory)
- Consider closing unused VS Code windows
- Monitor system memory usage
- Restart VS Code periodically for memory cleanup

## Monitoring Performance

### Check Process Usage
```powershell
Get-Process Code | Select-Object ProcessName, CPU, WorkingSet64 | Format-Table -AutoSize
```

### File System Performance
- Ensure antivirus excludes development directories
- Use SSD for workspace storage
- Exclude build directories from real-time scanning

## Request Queue Service Debugging

To enable logging for API debugging:
```typescript
// In request-queue-service.ts
private readonly enableLogging = true; // Set to true for debugging
```

This will show:
- Request queueing
- Processing status
- Completion/error states
- Queue size metrics
