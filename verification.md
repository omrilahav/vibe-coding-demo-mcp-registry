# Data Collection Service - Verification Guide

This document outlines steps to manually verify the Data Collection Service implementation works correctly.

## Components Verification

1. **Types and Interfaces:**
   - ✅ `MCPServerData` interface defines the standard format for server data
   - ✅ `SourceAdapter` interface provides a common contract for data source adapters
   - ✅ `CollectionOptions` interface supports configuration for collection operations
   - ✅ `NormalizedData` interface defines the output format for normalized data

2. **Source Adapters:**
   - ✅ `GitHubAdapter` implements the `SourceAdapter` interface
   - ✅ `GlamaAdapter` implements the `SourceAdapter` interface
   - ✅ Each adapter has proper error handling for API failures
   - ✅ Each adapter reports its status to the database

3. **Data Normalization:**
   - ✅ `DataNormalizer` correctly merges data from multiple sources
   - ✅ Tested with simple input data and verified expected output
   - ✅ Handles empty or incomplete data gracefully

4. **Collection Service:**
   - ✅ Implements scheduling using node-cron
   - ✅ Provides manual collection trigger API endpoint
   - ✅ Handles concurrent collection requests properly 
   - ✅ Updates database with collected information

## Manual Testing Steps

### 1. Initialize the Database

Run the following command to set up the database:

```bash
npm run db:setup
```

This will create the database, run migrations, and seed it with initial data.

### 2. Start the Application

Start the application in development mode:

```bash
npm run dev
```

### 3. Trigger Manual Collection

Make a POST request to the collection endpoint:

```bash
curl -X POST http://localhost:3001/api/collection/trigger
```

Or use the application UI to trigger collection (if available).

### 4. Verify Data in Database

Check that the database has been populated with MCP server data:

1. Look for records in the `MCPServer` table
2. Verify that `DataSource` records have been created and updated
3. Check that `Category` and `Capability` records exist for servers

### 5. Verify Scheduled Collection

To verify scheduled collection:

1. Change the cron schedule in the code to run more frequently for testing
2. Restart the application
3. Check logs to confirm that collection runs at the scheduled time
4. Verify that the database is updated with fresh data

## Known Limitations

1. **GitHub API Rate Limiting:**
   - The current implementation does not handle GitHub API rate limits optimally
   - For production, implement token rotation and more sophisticated backoff strategies

2. **Web Scraping Fragility:**
   - The Glama.ai adapter assumes a specific HTML structure
   - In a real implementation, it would need regular maintenance to handle site changes

3. **Limited Data Sources:**
   - Currently only two data sources are implemented
   - Future work should add more data sources like package registries

## Verification Results

- ✅ **Component Tests:** All tests for the DataNormalizer pass
- ✅ **Manual Testing:** Service starts and collects data as expected
- ✅ **Integration:** Service integrates with server startup and API endpoints 