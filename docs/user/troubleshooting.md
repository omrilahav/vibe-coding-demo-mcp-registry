# Troubleshooting Guide

This guide helps you diagnose and fix common issues with MCP Registry.

## Application Issues

### Application Won't Start

#### Symptoms
- Application doesn't open
- Application crashes immediately
- Blank or white screen

#### Solutions

1. **Check System Requirements**
   - Verify your OS version is supported
   - Ensure you have enough disk space
   - Check if you have required dependencies

2. **Clear Application Data**
   ```bash
   # Windows
   %APPDATA%\mcp-registry
   
   # macOS
   ~/Library/Application Support/mcp-registry
   
   # Linux
   ~/.config/mcp-registry
   ```
   - Delete the cache folder
   - Keep the settings file if you want to preserve your settings

3. **Reinstall the Application**
   - Uninstall completely
   - Remove leftover files
   - Download fresh copy
   - Install again

### Performance Issues

#### Symptoms
- Slow response time
- High CPU usage
- Memory leaks

#### Solutions

1. **Clear Cache**
   - Go to Settings → Storage
   - Click "Clear Cache"
   - Restart the application

2. **Reduce Data Load**
   - Limit the number of tracked servers
   - Increase refresh intervals
   - Disable automatic updates

3. **Update Application**
   - Check for latest version
   - Install updates
   - Clear old data after update

## Connection Issues

### Can't Connect to Servers

#### Symptoms
- "Connection Failed" errors
- Timeout messages
- Empty server list

#### Solutions

1. **Check Internet Connection**
   - Verify internet connectivity
   - Test other applications
   - Check firewall settings

2. **Verify Server Status**
   - Check server status page
   - Contact server administrator
   - Try alternative servers

3. **Network Configuration**
   - Check proxy settings
   - Verify network permissions
   - Reset network settings

### Sync Problems

#### Symptoms
- Out-of-date information
- Failed updates
- Sync errors

#### Solutions

1. **Force Sync**
   - Go to Settings → Sync
   - Click "Force Sync"
   - Wait for completion

2. **Reset Sync State**
   - Clear sync data
   - Re-authenticate
   - Restart sync process

### Glama API Connection Issues

#### Symptoms
- "Failed to load server data" error when clicking "Load Latest Servers" on homepage
- No new servers appear after clicking "Load Latest Servers"
- Error notifications when trying to fetch external data

#### Cause
There is a known issue with the Glama.ai API connection. The application is designed to fetch MCP server data from this external source, but there are connectivity problems with the API endpoint.

#### Solutions

1. **Use Local Data**
   - The application contains pre-loaded mock data and locally submitted servers
   - You can still use all features with the available local data
   - Submit new servers manually using the "Submit Server" page

2. **Try Again Later**
   - The external API may be temporarily unavailable
   - Try the "Load Latest Servers" button again at a later time

3. **Upcoming Fixes**
   - Future versions will implement additional data sources
   - More robust error handling for external API dependencies will be added
   - Check for application updates to get the latest fixes

## Data Issues

### Missing or Corrupt Data

#### Symptoms
- Missing server entries
- Incorrect information
- Database errors

#### Solutions

1. **Repair Database**
   - Go to Settings → Maintenance
   - Click "Repair Database"
   - Wait for completion

2. **Restore Backup**
   - Locate backup files
   - Import backup data
   - Verify restoration

3. **Reset Database**
   ```bash
   # Warning: This will delete all local data
   1. Close the application
   2. Navigate to data directory
   3. Delete database file
   4. Restart application
   ```

### Search Problems

#### Symptoms
- No search results
- Incorrect results
- Search hangs

#### Solutions

1. **Reset Search Index**
   - Go to Settings → Search
   - Click "Rebuild Index"
   - Wait for completion

2. **Clear Filters**
   - Reset all search filters
   - Clear search history
   - Try basic search first

## UI Issues

### Display Problems

#### Symptoms
- Broken layout
- Missing elements
- Visual glitches

#### Solutions

1. **Reset Window**
   - Press Ctrl/Cmd + R
   - Restart application
   - Reset window position

2. **Clear UI Cache**
   - Delete `.cache` folder
   - Reset display settings
   - Restart application

### Responsiveness Issues

#### Symptoms
- Delayed reactions
- Frozen interface
- Unresponsive buttons

#### Solutions

1. **Force Refresh**
   - Press Ctrl/Cmd + Shift + R
   - Clear application cache
   - Restart application

2. **Check Resources**
   - Monitor CPU usage
   - Check available memory
   - Close other applications

## Advanced Troubleshooting

### Logging

Enable detailed logging:
1. Go to Settings → Advanced
2. Enable "Debug Logging"
3. Reproduce the issue
4. Check logs at:
   ```
   # Windows
   %APPDATA%\mcp-registry\logs
   
   # macOS
   ~/Library/Logs/mcp-registry
   
   # Linux
   ~/.config/mcp-registry/logs
   ```

### Debug Mode

Start in debug mode:
```bash
# Windows
mcp-registry.exe --debug

# macOS/Linux
mcp-registry --debug
```

### Configuration Reset

Reset to default settings:
1. Close application
2. Delete config file:
   ```
   # Windows
   %APPDATA%\mcp-registry\config.json
   
   # macOS
   ~/Library/Application Support/mcp-registry/config.json
   
   # Linux
   ~/.config/mcp-registry/config.json
   ```
3. Restart application

## Still Having Problems?

If you're still experiencing issues:

1. **Check Known Issues**
   - Visit our GitHub issues page
   - Search for similar problems
   - Check for workarounds

2. **Get Support**
   - Join our Discord community
   - Open a GitHub issue
   - Contact support team

3. **Provide Information**
   - Application version
   - OS version and details
   - Steps to reproduce
   - Error messages
   - Log files 