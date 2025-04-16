# MCP Registry - UI Components

This document describes the key reusable components for the MCP Registry interface.

## Navigation Components

### App Header
- Fixed position at top of viewport
- Contains logo, search bar, and primary navigation
- Sticks to top on scroll
- Collapses to hamburger menu on mobile
- Height: 64px (desktop), 56px (mobile)

### Primary Navigation
- Horizontal menu on desktop, collapsible on mobile
- Items: Home, Categories, Submit Server, About
- Active state uses primary blue underline
- Hover state with light blue background
- Font: Medium weight, 16px

### Search Bar
- Prominent placement in header
- Expandable on mobile, persistent on desktop
- Includes search icon and clear button
- Typeahead suggestions appear below
- Placeholder text: "Search MCP servers..."

### Breadcrumb Navigation
- Used for nested pages
- Shows hierarchy and current location
- Clickable previous levels
- Non-clickable current level in medium gray

## Data Display Components

### Server Card
- Used in search results and listings
- Shows: Name, short description, reputation score, categories
- Background: White
- Border: Light gray, 1px
- Shadow: Level 1
- Border Radius: Medium (6px)
- Dimensions: Responsive width, 160px height
- Hover state with subtle shadow increase
- Click target is entire card

### Reputation Badge
- Circular indicator showing score 0-100
- Color-coded based on score range
- Size: 48px diameter (large), 32px (compact)
- Contains numerical score in center
- Stroke width changes based on score
- Tooltip on hover explains score components

### Category Tag
- Pill-shaped tags for server categories
- Background: Light gray
- Text: Dark gray
- Border Radius: Small (4px)
- Padding: 4px 8px
- Font: Small (14px), Regular weight
- Clickable to filter by category

### Server Detail Card
- Expanded view of server information
- Sections for metadata, reputation breakdown, usage info
- Tabbed interface for description, feedback, related servers
- Background: White
- Border: Light gray, 1px
- Shadow: Level 1
- Border Radius: Medium (6px)
- Padding: Large (24px)

### Feedback Item
- User-submitted feedback on servers
- Shows: Content, submission date, helpful votes
- Background: Light gray
- Border Radius: Small (4px)
- Padding: Medium (16px)
- Font: Medium (16px) for content, Small (14px) for metadata

## Input Components

### Button - Primary
- Used for primary actions
- Background: Primary Blue
- Text: White
- Border Radius: Medium (6px)
- Padding: 8px 16px
- Font: Semibold, Medium (16px)
- Hover state: Dark Blue
- Disabled state: Opacity 50%
- Loading state: With spinner

### Button - Secondary
- Used for secondary actions
- Background: White
- Text: Primary Blue
- Border: Primary Blue, 1px
- Border Radius: Medium (6px)
- Padding: 8px 16px
- Font: Semibold, Medium (16px)
- Hover state: Light Blue background
- Disabled state: Opacity 50%

### Button - Tertiary
- Used for minor actions
- Background: Transparent
- Text: Primary Blue
- Border: None
- Padding: 8px 16px
- Font: Medium, Medium (16px)
- Hover state: Light Blue background
- Disabled state: Opacity 50%

### Text Input
- Used for form fields
- Background: White
- Border: Medium Gray, 1px
- Border Radius: Small (4px)
- Padding: 8px 12px
- Font: Regular, Medium (16px)
- Focus state: Primary Blue border, 2px
- Error state: Error Red border
- Disabled state: Light Gray background
- Label position: Above input

### Select Dropdown
- Used for selection from options
- Same styling as Text Input
- Custom dropdown icon using chevron
- Options appear in dropdown panel
- Selected option shows in input field
- Multiple selection shows tags within input

### Checkbox
- Used for boolean selections
- Custom styled box with check icon
- Size: 20px × 20px
- States: unchecked, checked, indeterminate
- Focus state with blue outline
- Accompanied by right-aligned label

### Radio Button
- Used for single selection from options
- Custom styled circle with inner dot
- Size: 20px × 20px
- Focus state with blue outline
- Accompanied by right-aligned label

### Search Filter
- Collapsible filter sections
- Checkboxes for multiple selection filters
- Radio buttons for single selection filters
- Range sliders for numeric ranges
- "Apply Filters" and "Clear" buttons

## Feedback Components

### Toast Notification
- Appears temporarily for system messages
- Types: Success, Warning, Error, Info
- Color-coded based on type
- Appears at top of viewport
- Contains message and optional close button
- Auto-dismisses after 5 seconds
- Can be manually dismissed

### Loading State
- Spinner animation for loading content
- Primary blue color
- Size variants: Small (16px), Medium (24px), Large (32px)
- Optional loading text
- Used during data fetching

### Empty State
- Shown when no results are found
- Contains illustration, heading, and description
- Optional action button
- Centered in content area
- Background: Light gray

### Error State
- Shown when operations fail
- Contains error icon, heading, and description
- Option to retry or return to previous state
- Background: Light red or white

## Layout Components

### Container
- Main content wrapper
- Max width: 1200px
- Side padding: 16px (mobile), 32px (desktop)
- Center aligned in viewport
- Used to maintain consistent content width

### Card Grid
- Used for displaying multiple server cards
- Responsive grid layout
- Columns: 1 (mobile), 2 (tablet), 3 (desktop), 4 (large desktop)
- Gap: 16px between items
- Auto-fills available space

### Section Divider
- Used to separate content sections
- Height: 1px
- Color: Light gray
- Margin: 24px vertical

### Tabs
- Used for content organization within views
- Horizontal layout
- Active tab: Primary blue underline, semibold text
- Inactive tab: No underline, regular text
- Hover state: Light blue background
- Tab content appears below tab bar

### Modal
- Used for focused interactions and forms
- Background overlay: Black with 50% opacity
- Content background: White
- Border Radius: Large (8px)
- Shadow: Level 3
- Header with title and close button
- Footer with action buttons
- Responsive width: 90% on mobile, max 560px on desktop 