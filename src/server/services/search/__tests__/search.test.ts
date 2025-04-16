import searchService from '../../search';
import { prisma } from '../../../models/database';

// Mock the prisma client
jest.mock('../../../models/database', () => ({
  prisma: {
    mCPServer: {
      findMany: jest.fn(),
      count: jest.fn()
    },
    category: {
      findMany: jest.fn()
    }
  }
}));

// Mock the repository
jest.mock('../../../models/repositories', () => ({
  MCPServerRepository: {
    findAll: jest.fn(),
    count: jest.fn(),
    getAllCategories: jest.fn(),
    findById: jest.fn()
  }
}));

import { MCPServerRepository } from '../../../models/repositories';

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return servers and pagination', async () => {
      // Mock data
      const mockServers = [
        { id: '1', name: 'Test Server 1' },
        { id: '2', name: 'Test Server 2' }
      ];
      
      // Mock repository responses
      (MCPServerRepository.findAll as any).mockResolvedValue(mockServers);
      (MCPServerRepository.count as any).mockResolvedValue(2);

      // Execute search
      const result = await searchService.search({ query: 'test' });

      // Verify results
      expect(result.servers).toEqual(mockServers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        totalCount: 2,
        totalPages: 1
      });

      // Verify repository was called with correct parameters
      expect(MCPServerRepository.findAll).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'test' } },
            { description: { contains: 'test' } }
          ]
        },
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' }
      });
    });

    it('should handle category filtering', async () => {
      // Mock data
      const mockServers = [{ id: '1', name: 'Category Server' }];
      
      // Mock repository responses
      (MCPServerRepository.findAll as any).mockResolvedValue(mockServers);
      (MCPServerRepository.count as any).mockResolvedValue(1);

      // Execute search with category filter
      const result = await searchService.search({ 
        categories: ['category1'] 
      });

      // Verify results
      expect(result.servers).toEqual(mockServers);
      
      // Verify repository was called with category filter
      expect(MCPServerRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categories: {
              some: {
                categoryId: {
                  in: ['category1']
                }
              }
            }
          })
        })
      );
    });
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      // Mock data
      const mockCategories = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' }
      ];
      
      // Mock repository response
      (MCPServerRepository.getAllCategories as any).mockResolvedValue(mockCategories);

      // Execute getCategories
      const result = await searchService.getCategories();

      // Verify results
      expect(result).toEqual(mockCategories);
      expect(MCPServerRepository.getAllCategories).toHaveBeenCalled();
    });
  });

  describe('getServerById', () => {
    it('should return a server by id', async () => {
      // Mock data
      const mockServer = { id: '1', name: 'Test Server' };
      
      // Mock repository response
      (MCPServerRepository.findById as any).mockResolvedValue(mockServer);

      // Execute getServerById
      const result = await searchService.getServerById('1');

      // Verify results
      expect(result).toEqual(mockServer);
      expect(MCPServerRepository.findById).toHaveBeenCalledWith('1');
    });
  });
}); 