# Task 04: Reputation Scoring Engine Implementation

## Task Context

**What this task does**: Implement the Reputation Scoring Engine that calculates and updates reputation scores for MCP servers based on multiple factors like GitHub metrics, maintenance frequency, and open-source status.

**Why it's important**: The reputation scoring is a key differentiator for the MCP Registry, helping users quickly evaluate the quality and reliability of MCP servers. This component turns raw data into actionable insights for users.

**Related specs**:
- [Components and Services](/architecture/components.md)
- [Data Flow](/architecture/data-flow.md)
- [Architecture Overview](/architecture/overview.md)
- [Product Requirements Document](/product/PRD.md)

## Instructions

Implement the Reputation Scoring Engine that analyzes MCP server data from the database and generates reputation scores based on multiple factors. The engine should be modular and extensible to allow for future refinements to the scoring algorithm.

### Deliverables

1. **Score Calculator**: Implement the core scoring algorithm that:
   - Combines multiple factors with appropriate weights
   - Generates an overall reputation score (0-100)
   - Provides factor breakdowns for transparency

2. **Factor Analyzers**: Create separate modules for analyzing specific aspects:
   - GitHub metrics analyzer (stars, forks, last commit, etc.)
   - Maintenance frequency analyzer
   - Open-source status analyzer
   - License type analyzer

3. **Historical Tracker**: Implement a mechanism to:
   - Store historical reputation scores
   - Track score changes over time
   - Calculate trends (optional for MVP)

4. **Integration with Database**: Connect the engine to the database to:
   - Retrieve server data for scoring
   - Store calculated scores
   - Update scores when new data is collected

5. **Testing**: Implement unit tests for:
   - Each factor analyzer
   - The core scoring algorithm
   - Edge cases (missing data, extreme values)

### Implementation Details

#### Scoring Algorithm
- The algorithm should produce a score from 0-100
- Implement a weighted average of factor scores
- Make weights configurable for future adjustment
- Handle missing data gracefully (partial scoring)
- Consider implementing confidence levels for scores

#### Factor Analyzers

**GitHub Metrics Analyzer**
- Assess repository activity:
  - Stars (more is better)
  - Forks (more is better)
  - Watchers (more is better)
  - Open issues (balanced consideration)
  - Last commit date (more recent is better)
  - Contributors count (more is better)

**Maintenance Frequency Analyzer**
- Evaluate commit frequency patterns
- Consider the age of the repository
- Identify abandoned projects
- Assess issue response times (if available)

**Open-Source Status Analyzer**
- Verify if the code is publicly accessible
- Check if documentation is comprehensive
- Consider community engagement indicators

**License Type Analyzer**
- Assess license permissiveness
- Check license compatibility
- Verify license validity

#### Historical Tracking
- Store previous scores with timestamps
- Update scores without losing history
- Implement basic trend calculation (optional for MVP)

### Implementation Notes

- Design the scoring engine to be extensible (new factors can be added later)
- Make scoring weights configurable via a configuration file
- Implement proper error handling for edge cases
- Add detailed logging for scoring decisions
- Consider performance optimizations for batch scoring
- The scoring algorithm should be well-documented for transparency
- Consider adding visualization-friendly data formats for the UI
- Implement a recalculation trigger when new data is collected
- Add unit tests with a variety of test cases

## Checklist for Executor

- [ ] Reviewed all relevant specs and designs
- [ ] Reviewed the current codebase, especially the database schema and Data Collection Service
- [ ] Implemented the core scoring algorithm
- [ ] Created factor analyzer modules
- [ ] Implemented historical score tracking
- [ ] Integrated with the database layer
- [ ] Added appropriate logging and error handling
- [ ] Wrote tests for the scoring engine
- [ ] Documented the scoring algorithm and its configuration
- [ ] Updated the shared log with implementation summary, design decisions, and tips

Remember to append your implementation summary to `/tasks/implementation-summaries-and-recommendations.md` after completing this task. 