# MCP Registry - Components and Services

## Core Components

### 1. Data Collection Service

**Purpose**: Aggregates MCP server data from multiple external sources and normalizes it into a consistent format.

**Key Modules**:
- **Source Adapters**: Interfaces for each data source (GitHub, Glama.ai, etc.)
- **Data Normalization**: Standardizes data from different sources
- **Scheduler**: Manages periodic data refresh
- **Error Handler**: Manages failed collection attempts

**Responsibilities**:
- Fetch server metadata from configured sources
- Extract relevant information (names, descriptions, license info)
- Calculate GitHub metrics (stars, forks, last commit date)
- Handle rate limiting and authentication for APIs
- Validate and clean incoming data
- Normalize data into a consistent schema
- Schedule periodic updates

### 2. Reputation Scoring Engine

**Purpose**: Calculates and updates reputation scores for MCP servers based on multiple factors.

**Key Modules**:
- **Score Calculator**: Core algorithm for reputation scoring
- **Factor Analyzers**: Specialized modules for each scoring factor
- **Historical Tracker**: Tracks score changes over time

**Responsibilities**:
- Process normalized server data
- Apply scoring algorithms based on GitHub metrics
- Consider maintenance frequency and open-source status
- Generate overall reputation scores and factor breakdowns
- Track historical score changes
- Update scores when new data is collected

### 3. Search and Discovery Service

**Purpose**: Enables efficient searching, filtering, and browsing of the MCP server registry.

**Key Modules**:
- **Search Engine**: Text-based search functionality
- **Filter Engine**: Category, license, and metadata filtering
- **Sort Engine**: Multi-factor sorting capabilities
- **Query Optimizer**: Ensures efficient database queries

**Responsibilities**:
- Process user search queries
- Apply filters based on user selections
- Sort results according to user preferences
- Support pagination for large result sets
- Cache common search results
- Provide typeahead/autocomplete suggestions

### 4. User Contribution Service

**Purpose**: Manages user submissions of new servers and feedback on existing ones.

**Key Modules**:
- **Submission Handler**: Processes new server submissions
- **Feedback Collector**: Manages user feedback on servers

**Responsibilities**:
- Process new server submissions
- Validate submission data completeness
- Store user feedback and ratings

### 5. Web Interface

**Purpose**: Provides the user-facing application for interacting with the registry.

**Key Modules**:
- **Server Directory**: Main listing of MCP servers
- **Detail View**: Comprehensive server information
- **Search Interface**: UI for search and filtering
- **Submission Forms**: Forms for user contributions
- **Admin Dashboard**: (Future) For moderation and administration

**Responsibilities**:
- Render the user interface
- Handle user interactions
- Display search results
- Visualize reputation scores
- Present detailed server information
- Provide contribution forms
- Support responsive layouts for different devices

## Data Model

### Core Entities

1. **MCP Server**
   - Basic metadata (name, description, URL)
   - Source information (GitHub repo, etc.)
   - License information
   - Capability categories
   - Reputation scores
   - Timestamps (added, last updated)

2. **Data Source**
   - Source type (GitHub, Glama.ai, etc.)
   - Connection details
   - Last fetch timestamp
   - Status information

3. **User Contribution**
   - Contribution type (new server, feedback)
   - Server reference
   - Content
   - Submitter information
   - Timestamp
   - Status (pending, approved, rejected)

## Notes for Dev Team Lead

- **Implementation Priorities**:
  - Focus first on the Data Collection Service as it provides the foundation
  - Then implement a simple Reputation Scoring Engine with clear extension points
  - Develop the core Search functionality next
  - Add the User Contribution Service last (can be simplified for MVP)

- **Complexity Assessment**:
  - The Data Normalization module will be challenging due to inconsistent source formats
  - The Reputation Scoring Engine should be designed with extensibility in mind
  - The Search Engine should use SQLite's FTS capabilities for the MVP

- **Development Approach**:
  - Implement modular components with clear interfaces
  - Use dependency injection for better testability
  - Design the database schema first to ensure consistent data modeling
  - Create comprehensive unit tests for critical components like the Reputation Scoring Engine

- **Technical Debt Considerations**:
  - The initial SQLite implementation will need migration to PostgreSQL later
  - The MVP may use simplified authentication for contributions
  - Some data collection may initially use web scraping where APIs are unavailable 