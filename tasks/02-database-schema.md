# Task 02: Database Schema Setup

## Task Context

**What this task does**: Design and implement the database schema for the MCP Registry application, using SQLite and Prisma ORM.

**Why it's important**: The database schema serves as the foundation for data storage, ensuring proper organization and relationships between different entities in the system. A well-designed schema is critical for the performance and maintainability of the application.

**Related specs**:
- [Architecture Overview](/architecture/overview.md)
- [Components and Services](/architecture/components.md)
- [Data Flow](/architecture/data-flow.md)
- [Technology Stack](/architecture/stack.md)

## Instructions

Design and implement the database schema for the MCP Registry using Prisma ORM with SQLite. The schema should support all the data requirements specified in the architecture documents while being optimized for the search and discovery functionality.

### Deliverables

1. **Prisma Schema**: Create a Prisma schema file (`prisma/schema.prisma`) that defines:
   - All entities and their relationships
   - Appropriate field types and constraints
   - Indexes for efficient queries
   - Appropriate enums for categorical data

2. **Migration Script**: Create an initial migration script to set up the database schema.

3. **Seed Data**: Implement a basic seeding mechanism with some example MCP servers for development.

4. **Database Access Layer**: Create basic repository/data access functions for:
   - CRUD operations on MCP servers
   - CRUD operations on user contributions
   - Query functions for searching and filtering

5. **Database Initialization**: Implement logic to:
   - Check if the database exists
   - Create the database if it doesn't exist
   - Run migrations if the schema has changed
   - Check the last update date to determine if data collection is needed

### Core Entities to Implement

Based on the architecture documents, implement the following entities:

1. **MCP Server**
   - Basic metadata (name, description, URL)
   - Source information (GitHub repo URL, etc.)
   - License information
   - Capability categories
   - Timestamps (added, last updated)

2. **Reputation Score**
   - Relationship to MCP Server
   - Overall score
   - Component scores for different factors
   - Last calculated timestamp
   - Historical scores (optional for MVP)

3. **Data Source**
   - Source type (GitHub, Glama.ai, etc.)
   - Connection details
   - Last fetch timestamp
   - Status information

4. **User Contribution**
   - Contribution type (new server, feedback)
   - Relationship to MCP Server (if applicable)
   - Content
   - Submitter information
   - Timestamp
   - Status (pending, approved, rejected)

5. **Categories**
   - Name
   - Description
   - Parent category (for hierarchical categories, optional for MVP)

### Implementation Notes

- Use the Prisma ORM as specified in the technology stack
- Design the schema to be compatible with both SQLite and PostgreSQL (future)
- Implement appropriate indexes for search performance
- Consider FTS (Full-Text Search) capabilities for text search
- Implement soft delete where appropriate
- Follow naming conventions consistent with the codebase
- Consider the storage location for the SQLite database file (user's app data directory)
- Design with future extensibility in mind

## Checklist for Executor

- [ ] Reviewed all relevant specs and designs
- [ ] Reviewed the current codebase established in Task 01
- [ ] Designed and implemented the Prisma schema
- [ ] Created migration scripts
- [ ] Implemented seed data for development
- [ ] Created database access layer for CRUD operations
- [ ] Implemented database initialization logic
- [ ] Tested the schema with sample queries
- [ ] Added appropriate documentation
- [ ] Updated the shared log with implementation summary, design decisions, and tips

Remember to append your implementation summary to `/tasks/implementation-summaries-and-recommendations.md` after completing this task. 