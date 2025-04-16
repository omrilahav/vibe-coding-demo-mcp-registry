# Task 03: Data Collection Service Implementation

## Task Context

**What this task does**: Implement the Data Collection Service that aggregates MCP server data from external sources such as GitHub and Glama.ai, normalizes it, and stores it in the database.

**Why it's important**: The Data Collection Service is the foundation of the MCP Registry, responsible for gathering and maintaining up-to-date information about MCP servers. Without this service, the registry would have no data to display or analyze.

**Related specs**:
- [Components and Services](/architecture/components.md)
- [Data Flow](/architecture/data-flow.md)
- [Architecture Overview](/architecture/overview.md)
- [Technology Stack](/architecture/stack.md)

## Instructions

Implement the Data Collection Service that will gather MCP server information from external sources, normalize the data, and store it in the database. This service should be capable of running both during the initial application launch (if the database is empty or outdated) and on a scheduled basis.

### Deliverables

1. **Source Adapters**: Implement adapters for the following data sources:
   - GitHub API adapter (for repository metrics)
   - Glama.ai adapter (for scraping MCP server data)

2. **Data Normalization**: Create a module that normalizes data from different sources into a consistent format that matches the database schema.

3. **Collection Scheduler**: Implement a scheduler that triggers data collection:
   - On initial application launch if the database is empty
   - When the last update was more than 24 hours ago
   - Manually when triggered by the user

4. **Error Handling**: Implement robust error handling for:
   - API rate limiting (especially for GitHub)
   - Network failures
   - Parsing errors
   - Partial data collection failures

5. **Integration with Database**: Connect the service to the database layer created in Task 02 to:
   - Check when the last update occurred
   - Store collected data
   - Update existing records when new data is available

6. **Testing**: Implement unit tests for:
   - Source adapters (with mock responses)
   - Data normalization logic
   - Error handling scenarios

### Implementation Details

#### GitHub API Adapter
- Use Octokit (GitHub API client) as specified in the tech stack
- Implement authentication with GitHub API tokens
- Handle rate limiting with appropriate backoff strategies
- Extract relevant repository metrics:
  - Stars, forks, watchers
  - Last commit date
  - Open issues count
  - License information
  - Contributors count
  - README content (for descriptions)

#### Glama.ai Adapter
- Implement web scraping using Cheerio (as specified in the tech stack)
- Extract MCP server information from Glama.ai's directory
- Handle pagination to collect all available servers
- Parse server capabilities and categories

#### Data Normalization
- Create a unified data model that merges information from different sources
- Implement conflict resolution for contradictory information
- Generate unique identifiers for servers
- Map external categories to internal category system
- Validate normalized data against the database schema

#### Collection Scheduler
- Use node-cron for scheduling periodic updates
- Implement mechanisms to check the database's last update timestamp
- Create logic to determine if a collection run is needed
- Add configuration options for collection frequency

### Implementation Notes

- Handle API rate limits carefully, especially for GitHub
- Implement proper logging throughout the service
- Consider implementing a queueing system for large collection jobs
- Store raw responses temporarily to aid in debugging
- Design the service to be resilient to partial failures
- Make source adapters modular so new sources can be added later
- Consider implementing incremental updates rather than full rebuilds when possible
- Implement appropriate metrics to track collection performance and success rates

## Checklist for Executor

- [ ] Reviewed all relevant specs and designs
- [ ] Reviewed the current codebase and database schema
- [ ] Implemented GitHub API adapter
- [ ] Implemented Glama.ai adapter
- [ ] Created data normalization module
- [ ] Implemented collection scheduler
- [ ] Added robust error handling
- [ ] Integrated with database layer
- [ ] Added appropriate logging
- [ ] Wrote tests for key components
- [ ] Documented the service and its configuration options
- [ ] Updated the shared log with implementation summary, design decisions, and tips

Remember to append your implementation summary to `/tasks/implementation-summaries-and-recommendations.md` after completing this task. 