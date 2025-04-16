import { DataCollectionService } from '../index';
import { GitHubAdapter } from '../adapters/github';
import { GlamaAdapter } from '../adapters/glamai';
import { MCPServerData } from '../types';

// Mock the adapters
jest.mock('../adapters/github');
jest.mock('../adapters/glamai');
jest.mock('.prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      mCPServer: {
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
        update: jest.fn().mockResolvedValue({ id: 'mock-id' }),
      },
      dataSource: {
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({ id: 'data-source-id' }),
      },
      category: {
        upsert: jest.fn().mockResolvedValue({ id: 'category-id' }),
      },
      categoryToServer: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      capability: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'capability-id' }),
        update: jest.fn().mockResolvedValue({ id: 'capability-id' }),
      },
    })),
  };
});

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn(),
  }),
}));

// Mocked implementation types
const MockedGitHubAdapter = GitHubAdapter as jest.Mock;
const MockedGlamaAdapter = GlamaAdapter as jest.Mock;

describe('DataCollectionService', () => {
  let service: DataCollectionService;
  
  // Sample MCP server data for tests
  const mockServerData: MCPServerData[] = [
    {
      name: 'Test MCP Server',
      description: 'A test server',
      url: 'https://example.com/mcp',
      repositoryUrl: 'https://github.com/example/mcp-server',
      categories: ['test', 'mcp'],
      capabilities: [
        { name: 'capability1', description: 'Description 1' },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up adapter mocks
    MockedGitHubAdapter.mockImplementation(() => ({
      getName: jest.fn().mockReturnValue('github'),
      collect: jest.fn().mockResolvedValue(mockServerData),
      updateDataSource: jest.fn().mockResolvedValue(undefined),
    }));
    
    MockedGlamaAdapter.mockImplementation(() => ({
      getName: jest.fn().mockReturnValue('glama.ai'),
      collect: jest.fn().mockResolvedValue(mockServerData),
      updateDataSource: jest.fn().mockResolvedValue(undefined),
    }));
    
    service = new DataCollectionService();
  });

  it('should collect data at startup if needed', async () => {
    await service.start();
    // Since we mocked mCPServer.count to return 0, it should trigger collection
    const githubInstance = MockedGitHubAdapter.mock.instances[0];
    expect(githubInstance.collect).toHaveBeenCalled();
  });

  it('should manually trigger collection', async () => {
    await service.triggerCollection();
    const glamaInstance = MockedGlamaAdapter.mock.instances[0];
    expect(glamaInstance.collect).toHaveBeenCalled();
  });

  it('should filter adapters based on options', async () => {
    await service.triggerCollection({ sources: ['github'] });
    
    const githubInstance = MockedGitHubAdapter.mock.instances[0];
    const glamaInstance = MockedGlamaAdapter.mock.instances[0];
    
    expect(githubInstance.collect).toHaveBeenCalled();
    expect(glamaInstance.collect).not.toHaveBeenCalled();
  });

  it('should handle errors during collection and continue with other adapters', async () => {
    // Make GitHub adapter throw an error
    MockedGitHubAdapter.mockImplementation(() => ({
      getName: jest.fn().mockReturnValue('github'),
      collect: jest.fn().mockRejectedValue(new Error('API Rate limit exceeded')),
      updateDataSource: jest.fn().mockResolvedValue(undefined),
    }));

    await service.triggerCollection();
    
    // The Glama adapter should still be called despite GitHub adapter error
    const glamaInstance = MockedGlamaAdapter.mock.instances[0];
    expect(glamaInstance.collect).toHaveBeenCalled();
  });

  it('should not collect data if collection is already in progress', async () => {
    // Start one collection process
    const firstCollection = service.triggerCollection();
    
    // Try to start another before the first completes
    await service.triggerCollection();
    
    // Wait for the first to complete
    await firstCollection;
    
    // Adapters should only be called once
    const githubInstance = MockedGitHubAdapter.mock.instances[0];
    expect(githubInstance.collect).toHaveBeenCalledTimes(1);
  });
}); 