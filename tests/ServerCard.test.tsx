import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import ServerCard, { ServerCardProps } from '../src/renderer/components/ServerCard'; // Import ServerCardProps

describe('ServerCard Component', () => {
  // Use ServerCardProps to type the mock data
  const mockServer: ServerCardProps = {
    id: '1',
    name: 'Test Server',
    description: 'A simple test server.',
    reputation: 85, // Use 'reputation' as defined in props
    categories: ['Test Category'], // Use string[] as defined in props
  };

  // Helper function to render with Router context
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it('renders server name and description', () => {
    // Pass the props correctly to the component
    renderWithRouter(<ServerCard {...mockServer} />); 
    
    expect(screen.getByText('Test Server')).toBeInTheDocument();
    expect(screen.getByText('A simple test server.')).toBeInTheDocument();
  });

  it('renders server categories', () => {
    // Pass the props correctly to the component
    renderWithRouter(<ServerCard {...mockServer} />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  // Add more basic checks if needed, e.g., for reputation badge
  it('renders reputation badge', () => {
    renderWithRouter(<ServerCard {...mockServer} />);
    // ReputationBadge likely renders the score within it, maybe with text like "Reputation:"
    // Let's check for the number itself, assuming it's displayed directly or within an element.
    // A more robust test might use a data-testid if the Badge component has one.
    expect(screen.getByText('85')).toBeInTheDocument(); 
  });
}); 