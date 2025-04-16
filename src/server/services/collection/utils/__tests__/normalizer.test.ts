import { DataNormalizer } from '../normalizer';
import { MCPServerData } from '../../types';

describe('DataNormalizer', () => {
  let normalizer: DataNormalizer;

  beforeEach(() => {
    normalizer = new DataNormalizer();
  });

  it('should merge data from multiple sources', () => {
    // Data from GitHub source
    const githubData: MCPServerData[] = [
      {
        name: 'Server A',
        url: 'https://server-a.com',
        repositoryUrl: 'https://github.com/org/server-a',
        owner: 'org',
        ownerType: 'organization',
        license: 'MIT',
        repoMetrics: {
          stars: 100,
          forks: 30,
          watchers: 10,
          openIssuesCount: 5,
          contributorsCount: 8,
        },
      },
    ];

    // Data from Glama source
    const glamaData: MCPServerData[] = [
      {
        name: 'Server A', // Same server
        description: 'A great MCP server',
        url: 'https://server-a.com',
        categories: ['mcp', 'ai'],
        capabilities: [
          {
            name: 'text-generation',
            description: 'Generates text based on input',
          },
          {
            name: 'image-understanding',
            description: 'Analyzes image content',
          },
        ],
      },
      {
        name: 'Server B', // Different server
        description: 'Another MCP server',
        url: 'https://server-b.com',
        categories: ['mcp', 'search'],
        capabilities: [
          {
            name: 'search',
            description: 'Performs semantic search',
          },
        ],
      },
    ];

    const result = normalizer.normalize([githubData, glamaData]);

    // Should have both servers
    expect(result.mcpServers).toHaveLength(2);

    // Find Server A in results
    const serverA = result.mcpServers.find(s => s.url === 'https://server-a.com');
    expect(serverA).toBeDefined();
    
    if (serverA) {
      // Should have combined properties from both sources
      expect(serverA.name).toBe('Server A');
      expect(serverA.description).toBe('A great MCP server');
      expect(serverA.repositoryUrl).toBe('https://github.com/org/server-a');
      expect(serverA.owner).toBe('org');
      expect(serverA.license).toBe('MIT');
      expect(serverA.categories).toEqual(['mcp', 'ai']);
      expect(serverA.repoMetrics?.stars).toBe(100);
      expect(serverA.capabilities).toHaveLength(2);
    }

    // Find Server B in results
    const serverB = result.mcpServers.find(s => s.url === 'https://server-b.com');
    expect(serverB).toBeDefined();
    
    if (serverB) {
      expect(serverB.name).toBe('Server B');
      expect(serverB.categories).toEqual(['mcp', 'search']);
      expect(serverB.capabilities).toHaveLength(1);
    }
  });

  it('should merge capabilities by name', () => {
    // First data set with basic capability info
    const data1: MCPServerData[] = [
      {
        name: 'Server',
        url: 'https://server.com',
        capabilities: [
          {
            name: 'text-generation',
            description: 'Generates text',
          }
        ],
      },
    ];

    // Second data set with more detailed capability
    const data2: MCPServerData[] = [
      {
        name: 'Server',
        url: 'https://server.com',
        capabilities: [
          {
            name: 'text-generation',
            details: '{"maxLength": 4096, "formats": ["json", "text"]}',
          },
          {
            name: 'image-generation',
            description: 'Creates images',
            details: '{"formats": ["png", "jpeg"]}',
          }
        ],
      },
    ];

    const result = normalizer.normalize([data1, data2]);
    
    expect(result.mcpServers).toHaveLength(1);
    const server = result.mcpServers[0];
    
    // Should combine the two capabilities
    expect(server.capabilities).toHaveLength(2);
    
    // Find text-generation capability
    const textGen = server.capabilities?.find(c => c.name === 'text-generation');
    expect(textGen).toBeDefined();
    
    if (textGen) {
      // Should have description from first source and details from second
      expect(textGen.description).toBe('Generates text');
      expect(textGen.details).toBe('{"maxLength": 4096, "formats": ["json", "text"]}');
    }
    
    // Should also have the image-generation capability
    const imageGen = server.capabilities?.find(c => c.name === 'image-generation');
    expect(imageGen).toBeDefined();
  });

  it('should handle empty or incomplete data sets', () => {
    // Empty data
    expect(normalizer.normalize([[], []])).toEqual({ mcpServers: [] });
    
    // Incomplete data
    const incompleteData: MCPServerData[] = [
      {
        name: 'Incomplete Server',
        url: 'https://incomplete.com',
      },
    ];
    
    const result = normalizer.normalize([incompleteData]);
    expect(result.mcpServers).toHaveLength(1);
    expect(result.mcpServers[0].name).toBe('Incomplete Server');
    expect(result.mcpServers[0].categories).toBeUndefined();
    expect(result.mcpServers[0].capabilities).toBeUndefined();
  });
}); 