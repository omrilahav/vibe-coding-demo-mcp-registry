# MCP Registry - Notes for Developers

This document provides implementation guidance, edge cases, and technical considerations for developing the MCP Registry application.

## Implementation Priorities

1. **Data Collection System** - Build this first as the foundation
2. **Basic UI Components** - Create the core reusable components
3. **Server Directory and Search** - Enable the main discovery functionality
4. **Server Detail View** - Implement comprehensive server information display
5. **User Contributions** - Add submission forms and feedback mechanisms

## Shared Component Implementation

### Reputation Score Visualization

The reputation score visualization is used across multiple views and should be implemented as a shared component:

```tsx
// Example implementation approach
interface ReputationBadgeProps {
  score: number;
  size: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({ score, size, showTooltip }) => {
  // Calculate color based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Success Green
    if (score >= 50) return '#F59E0B'; // Warning Yellow
    return '#EF4444'; // Error Red
  };
  
  // Render circular progress indicator with score
  // ...
};
```

Considerations:
- Support different sizes (32px, 48px)
- Include optional tooltips explaining score components
- Use accessible colors with sufficient contrast
- Animation should be subtle and performant
- Support server with missing scores (show as "N/A")

### Search Implementation

The search functionality appears in multiple contexts and should use a consistent approach:

```tsx
// Example search implementation
interface SearchOptions {
  query: string;
  categories?: string[];
  licenseTypes?: string[];
  minReputationScore?: number;
  lastUpdated?: string;
  sortBy?: 'relevance' | 'reputation' | 'recent' | 'alphabetical';
  page?: number;
  perPage?: number;
}

const searchServers = async (options: SearchOptions) => {
  // Construct API query and return results
  // ...
};
```

Considerations:
- Implement debounce for search input (300-500ms)
- Support both text search and filter combinations
- Cache recent search results for performance
- Show loading states during searches
- Handle empty results appropriately

## Responsive Design Implementation

The application needs to work well on both desktop and mobile devices:

### Breakpoints
Implementation should follow these breakpoints:
- Mobile: Up to 639px
- Tablet: 640px - 1023px
- Desktop: 1024px and above

### Component-Specific Adaptations
- **App Header**: Collapse navigation to hamburger menu on mobile
- **Search Bar**: Full width on mobile, inline with nav on desktop
- **Filter Panel**: Side panel on desktop, collapsible accordion on mobile
- **Server Cards**: 1 column on mobile, 2-3 on tablet, 3-4 on desktop

## State Management

Use React Context API for global state, with consideration for future Redux implementation if complexity increases:

```tsx
// Example state management approach
interface AppState {
  servers: Server[];
  categories: Category[];
  searchOptions: SearchOptions;
  // Additional state...
}

const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
}>({ state: initialState, dispatch: () => null });

// Actions
const actions = {
  SET_SERVERS: 'SET_SERVERS',
  SET_SEARCH_OPTIONS: 'SET_SEARCH_OPTIONS',
  // Additional actions...
};
```

## Edge Cases to Handle

### 1. Data Collection

- **API Rate Limiting**: Implement exponential backoff for GitHub API calls
- **Incomplete Data**: Handle servers with missing fields gracefully
- **Data Freshness**: Check last update time and re-fetch if older than 24 hours
- **Source Unavailability**: Continue with partial data if one source is down

### 2. Search and Filtering

- **No Results**: Show helpful empty state with suggestions
- **Very Large Result Sets**: Implement pagination with reasonable defaults (20-25 items per page)
- **Complex Queries**: Limit maximum filter combinations to prevent performance issues
- **Special Characters**: Handle special characters in search queries properly

### 3. Server Details

- **Missing Metadata**: Show "Not available" for missing information
- **Long Descriptions**: Truncate with "Show more" option
- **External Links**: Validate links before displaying; handle broken links gracefully
- **Server Updates**: Show "recently updated" indicator for servers changed in the last week

### 4. User Contributions

- **Duplicate Submissions**: Check for and prevent duplicate server submissions
- **Form Validation**: Implement both client and server-side validation
- **Feedback Abuse**: Limit feedback submission frequency (e.g., one per user per server per day)
- **Large Submissions**: Handle large text submissions with reasonable limits

## Performance Considerations

### Key Performance Metrics
- **Initial Load Time**: Target < 2 seconds
- **Time to Interactive**: Target < 3 seconds
- **Search Response Time**: Target < 500ms

### Optimization Strategies
1. **Component Lazy Loading**: Defer non-critical components
2. **Search Optimization**: Implement debounce and caching
3. **Image Optimization**: Lazy load images and use appropriate formats
4. **Bundle Size**: Keep initial bundle < 200KB compressed

## Accessibility Requirements

- Implement proper ARIA attributes for all interactive elements
- Ensure keyboard navigation works throughout the application
- Maintain minimum contrast ratio of 4.5:1 for text
- Support screen readers with appropriate alt text and labels
- Make all functionality available without requiring a mouse

## Local Development Setup

When working with the SQLite database in development:
1. Create migration scripts for schema changes
2. Include sample data for development
3. Document database structure in code comments
4. Handle database file creation on first run

## Testing Considerations

- Implement comprehensive unit tests for core components
- Add integration tests for key user flows
- Test on multiple devices and browsers
- Verify accessibility with automated tools
- Test with both small and large datasets

## Future Extension Points

Design these components with future enhancements in mind:

1. **Reputation Algorithm**: Make scoring logic pluggable and configurable
2. **User Accounts**: Plan for future authentication integration
3. **API Access**: Design data models to support future API endpoints
4. **Dark Mode**: Structure CSS to allow for future theme switching 