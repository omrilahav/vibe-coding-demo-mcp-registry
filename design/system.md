# MCP Registry - Design System

## Brand Identity

### Name and Positioning
- **Product Name**: MCP Registry
- **Tagline**: "Discover trusted MCP servers for AI development"
- **Voice**: Professional, technical, trustworthy, and straightforward

### Logo
- Simple wordmark using the primary blue color
- Optional icon showing a registry/database with connected nodes
- Use in header and favicon

## Color System

### Primary Palette
- **Primary Blue**: `#2563EB` - Main brand color, used for primary actions and key UI elements
- **Dark Blue**: `#1E40AF` - Hover states and secondary emphasis
- **Light Blue**: `#DBEAFE` - Backgrounds, highlights, selected states

### Secondary Palette
- **Success Green**: `#10B981` - Positive indicators, high reputation scores
- **Warning Yellow**: `#F59E0B` - Medium reputation scores, notifications
- **Error Red**: `#EF4444` - Critical issues, low reputation scores
- **Neutral Gray**: `#6B7280` - Secondary text, borders, dividers

### Neutral Palette
- **Background White**: `#FFFFFF` - Main background
- **Light Gray**: `#F3F4F6` - Secondary background, cards, form fields
- **Medium Gray**: `#D1D5DB` - Borders, dividers
- **Dark Gray**: `#4B5563` - Secondary text
- **Text Black**: `#1F2937` - Primary text

## Typography

### Font Family
- **Primary Font**: Inter - A clean, modern sans-serif font
- **Monospace Font**: JetBrains Mono - For code snippets or technical data
- **Fallbacks**: System UI fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)

### Font Sizes
- **Base**: 16px (1rem)
- **XS**: 0.75rem (12px) - Fine print, footnotes
- **Small**: 0.875rem (14px) - Secondary text, metadata
- **Medium**: 1rem (16px) - Body text, default size
- **Large**: 1.125rem (18px) - Emphasized text, subheadings
- **XL**: 1.25rem (20px) - Section headings
- **2XL**: 1.5rem (24px) - Page titles
- **3XL**: 1.875rem (30px) - Hero titles

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Subheadings, emphasis
- **Semibold**: 600 - Headings, buttons
- **Bold**: 700 - Strong emphasis, key metrics

## Spacing

### Base Unit
- 4px (0.25rem) spacing unit

### Spacing Scale
- **XS**: 0.25rem (4px)
- **Small**: 0.5rem (8px)
- **Medium**: 1rem (16px)
- **Large**: 1.5rem (24px)
- **XL**: 2rem (32px)
- **2XL**: 3rem (48px)

### Layout Spacing
- **Container Padding**: 1rem (16px) on small screens, 2rem (32px) on larger screens
- **Card Padding**: 1rem (16px)
- **Section Margins**: 2rem (32px) vertical space between sections
- **Grid Gap**: 1rem (16px) between grid items

## Border Radius
- **Small**: 0.25rem (4px) - Form inputs, tags
- **Medium**: 0.375rem (6px) - Cards, buttons
- **Large**: 0.5rem (8px) - Modals, dropdowns

## Elevation (Shadows)
- **Level 1**: `0 1px 3px rgba(0, 0, 0, 0.1)` - Cards, navbar
- **Level 2**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` - Dropdowns, popovers
- **Level 3**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)` - Modals, dialogs

## Visual Language

### Reputation Score Visualization
- Color-coded score indicators:
  - **High Score** (80-100): Green (`#10B981`)
  - **Medium Score** (50-79): Yellow (`#F59E0B`)
  - **Low Score** (0-49): Red (`#EF4444`)
- Circular progress indicator showing score percentage
- Accompanying numerical value (0-100)

### Icons
- Use a consistent icon set (Phosphor Icons or similar)
- 20px size for navigation and UI elements
- 16px for inline text icons
- Maintain consistent stroke width

### Data Visualization
- Clean, minimal charts with consistent color usage
- Use the primary color palette for data points
- Clear labels and sufficient white space
- Accessible color choices with sufficient contrast

## Responsive Behavior
- **Mobile First**: Design for mobile, then enhance for larger screens
- **Breakpoints**:
  - Small: 640px
  - Medium: 768px
  - Large: 1024px
  - XL: 1280px
- **Grid System**: 12-column layout for structured alignment
- **Component Adaptations**: Define how components change across breakpoints

## Accessibility
- Maintain WCAG AA compliance for color contrast
- Include focus states for keyboard navigation
- Support dark mode for reduced eye strain (future enhancement)
- Ensure text remains readable at all breakpoints 