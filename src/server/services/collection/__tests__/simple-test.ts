import { DataNormalizer } from '../utils/normalizer';
import { MCPServerData, NormalizedData } from '../types';

describe('DataNormalizer', () => {
  let normalizer: DataNormalizer;
  
  beforeEach(() => {
    normalizer = new DataNormalizer();
  });
  
  test('should combine data from multiple sources', () => {
    // Setup test data
    const githubData: MCPServerData[] = [
      {
        name: 'Test Server',
        url: 'https://test-server.com',
        repositoryUrl: 'https://github.com/test/server',
        owner: 'test-owner'
      }
    ];
    
    const glamaData: MCPServerData[] = [
      {
        name: 'Test Server',
        description: 'A test server with capabilities',
        url: 'https://test-server.com',
        capabilities: [{ name: 'capability1' }]
      }
    ];
    
    // Execute
    const result = normalizer.normalize([githubData, glamaData]);
    
    // Verify
    expect(result.mcpServers.length).toBe(1);
    const server = result.mcpServers[0];
    expect(server.name).toBe('Test Server');
    expect(server.description).toBe('A test server with capabilities');
    expect(server.owner).toBe('test-owner');
    expect(server.repositoryUrl).toBe('https://github.com/test/server');
    expect(server.capabilities?.length).toBe(1);
  });
  
  test('should handle empty data sets', () => {
    const result = normalizer.normalize([[], []]);
    expect(result.mcpServers.length).toBe(0);
  });
}); 