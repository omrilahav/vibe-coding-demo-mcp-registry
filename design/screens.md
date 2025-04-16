# MCP Registry - Screens and Flows

This document describes the key screens and user flows for the MCP Registry application.

## 1. Homepage

### Purpose
The entry point to the application, providing an overview of the MCP Registry and quick access to search and discovery.

### Layout
- **Header**: App header with logo, navigation, and search bar
- **Hero Section**:
  - Headline: "Discover Trusted MCP Servers"
  - Subheadline: Brief explanation of what MCP Registry offers
  - Primary CTA: "Explore Servers" button
  - Background: Subtle gradient or pattern using brand colors
- **Statistics Bar**:
  - Number of indexed servers
  - Number of categories
  - Total user contributions
- **Featured Servers Section**:
  - Grid of 3-4 server cards for top-rated servers
  - "View All" link to full directory
- **Categories Section**:
  - Visual grid of major server categories
  - Each category shows icon, name, and count
  - Clickable to filter the directory by category
- **About Section**:
  - Brief overview of MCP Registry purpose
  - Benefits for developers
  - Link to more detailed about page

### Interactions
- Search bar initiates search function
- Category tiles filter the directory view
- Featured server cards link to server detail pages
- CTAs lead to the server directory

## 2. Server Directory

### Purpose
The main discovery interface, allowing users to search, filter, and browse available MCP servers.

### Layout
- **Header**: Standard app header
- **Search Controls**:
  - Persistent search bar at top
  - Filter panel on left side (collapsible on mobile)
  - Sort controls (dropdown) on right side
- **Results Area**:
  - Grid of server cards (responsive layout)
  - Pagination controls at bottom
  - "X results found" indicator
- **Empty State** (when no results):
  - Illustration
  - "No servers found" message
  - Suggestions to modify search
- **Loading State**:
  - Skeleton loading cards during data fetch

### Filter Panel
- **Categories**:
  - Checkbox list of server categories
  - "Show more" expansion for long lists
- **License Type**:
  - Radio buttons for license options
  - Options: All, Open Source, Commercial, etc.
- **Reputation Score**:
  - Slider for minimum reputation score
  - Presets: High (80+), Medium (50-79), Any
- **Last Updated**:
  - Options for recency filtering
  - Presets: Past week, Past month, Past year, Any

### Interactions
- Real-time filtering as options are selected
- Sort options: Relevance, Highest Rating, Most Recent, Alphabetical
- Pagination with configurable results per page
- Clicking a server card navigates to its detail page
- Filter reset button clears all active filters

## 3. Server Detail Page

### Purpose
Provides comprehensive information about a specific MCP server, including metadata, reputation details, and user feedback.

### Layout
- **Header**: Standard app header with breadcrumb navigation
- **Server Overview Section**:
  - Server name and logo (if available)
  - Reputation score badge (large)
  - Short description
  - Category tags
  - Key metadata (license, language, etc.)
  - Action buttons: "Visit GitHub", "View Documentation", etc.
- **Tabs Section**:
  - Description tab (default)
  - Reputation Details tab
  - Feedback tab
  - Usage Information tab
- **Description Tab Content**:
  - Full server description
  - Feature list
  - Usage examples
- **Reputation Tab Content**:
  - Score breakdown visualization
  - Component scores with explanations
  - Historical score chart
- **Feedback Tab Content**:
  - User submitted feedback items
  - Form to submit new feedback
  - Sorting options for feedback
- **Usage Tab Content**:
  - Installation instructions
  - Basic usage examples
  - Common configuration options
- **Related Servers Section**:
  - Horizontally scrollable list of similar servers
  - Based on category and functionality

### Interactions
- Tab switching changes content area
- "Submit Feedback" button reveals feedback form
- External links open in new tab
- Related server cards navigate to those server pages

## 4. Submit Server Form

### Purpose
Allows users to contribute new MCP servers to the registry.

### Layout
- **Header**: Standard app header with "Submit Server" title
- **Form Container**:
  - Introduction text explaining submission process
  - Form fields (see below)
  - Submit and Cancel buttons
- **Form Fields**:
  - Server Name (text input) *required
  - Server URL/GitHub Repository (text input) *required
  - Description (text area) *required
  - Categories (multi-select dropdown) *required
  - License Type (select dropdown) *required
  - Documentation URL (text input) *optional
  - Additional Notes (text area) *optional
- **Submission Guidelines**:
  - Brief list of requirements for acceptance
  - Link to detailed submission policy

### Interactions
- Real-time validation of required fields
- Submit button disabled until all required fields valid
- Success confirmation after submission
- Error feedback for validation issues

## 5. Search Results

### Purpose
Displays filtered results based on user search queries.

### Layout
- **Header**: Standard app header with search query displayed
- **Search Controls**:
  - Refined search input (prepopulated with current query)
  - Filter panel (identical to Server Directory)
  - Sort controls (dropdown)
- **Results Area**:
  - Grid of server cards matching search
  - "X results for [query]" header
  - Highlighted matching terms in results
- **No Results State**:
  - Friendly message for zero results
  - Search tips
  - Suggested alternative searches

### Interactions
- Same as Server Directory
- Query terms highlighted in result cards
- Refinement suggestions offered based on query

## 6. About Page

### Purpose
Provides information about the MCP Registry project, its goals, and how it works.

### Layout
- **Header**: Standard app header
- **Mission Section**:
  - "About MCP Registry" heading
  - Mission statement and goals
  - Key benefits highlighted
- **How It Works Section**:
  - Explanation of data collection
  - Description of reputation scoring algorithm
  - Visual representation of the process
- **Contribution Section**:
  - How users can contribute
  - Benefits of community participation
  - Link to submission form
- **FAQ Section**:
  - Collapsible FAQ items addressing common questions
  - Grouped by topic

### Interactions
- Collapsible FAQ items expand/collapse on click
- CTA buttons for contribution and exploration

## Key User Flows

### 1. Discovery Flow
1. User arrives at Homepage
2. User browses categories or uses search bar
3. User views Server Directory with filtered results
4. User applies additional filters if needed
5. User selects a server of interest
6. User views Server Detail Page
7. User accesses external resources or submits feedback

### 2. Contribution Flow
1. User selects "Submit Server" from navigation
2. User completes submission form
3. User receives confirmation of submission
4. User can view their submission in the directory (if no moderation queue)

### 3. Search Flow
1. User enters query in search bar from any page
2. User views Search Results page
3. User refines search or applies filters
4. User selects a server from results
5. User views Server Detail Page

### 4. Feedback Flow
1. User views Server Detail Page
2. User selects Feedback tab
3. User reads existing feedback
4. User submits their own feedback via form
5. User sees their feedback added to the list 