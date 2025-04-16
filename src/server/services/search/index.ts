import { MCPServerRepository } from '../../models/repositories';
import { prisma } from '../../models/database';

// Default pagination values
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE = 1;

// Types for search parameters
export interface SearchParams {
  query?: string;
  categories?: string[];
  license?: string;
  minScore?: number;
  maxScore?: number;
  lastUpdated?: string; // e.g., "7d", "30d", "90d", "1y"
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'reputation' | 'updated' | 'name';
}

// Main search and discovery service
const searchService = {
  /**
   * Search for MCP servers based on search parameters
   */
  search: async (params: SearchParams) => {
    const {
      query,
      categories,
      license,
      minScore,
      maxScore,
      lastUpdated,
      page = DEFAULT_PAGE,
      limit = DEFAULT_PAGE_SIZE,
      sort = 'relevance'
    } = params;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build the where condition
    const whereConditions: any = {
      isActive: true,
    };

    // Add text search condition if query is provided
    if (query) {
      whereConditions.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    // Add category filter
    if (categories && categories.length > 0) {
      whereConditions.categories = {
        some: {
          categoryId: {
            in: categories
          }
        }
      };
    }

    // Add license filter
    if (license) {
      whereConditions.license = license;
    }

    // Add last updated filter
    if (lastUpdated) {
      const date = new Date();
      switch (lastUpdated) {
        case '7d':
          date.setDate(date.getDate() - 7);
          break;
        case '30d':
          date.setDate(date.getDate() - 30);
          break;
        case '90d':
          date.setDate(date.getDate() - 90);
          break;
        case '1y':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      whereConditions.updatedAt = { gte: date };
    }

    // Build the orderBy condition
    let orderBy: any = {};
    switch (sort) {
      case 'reputation':
        orderBy = {
          reputationScores: {
            orderBy: {
              overallScore: 'desc'
            }
          }
        };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'relevance':
      default:
        // If there's a query, sort by relevance, otherwise by reputation
        if (query) {
          // Simple name sorting for basic relevance
          orderBy = { name: 'asc' };
        } else {
          orderBy = {
            reputationScores: {
              orderBy: {
                overallScore: 'desc'
              }
            }
          };
        }
    }

    // Execute the query to get servers
    const servers = await MCPServerRepository.findAll({
      where: whereConditions,
      skip,
      take: limit,
      orderBy
    });

    // Get the total count for pagination
    const totalCount = await MCPServerRepository.count({
      where: whereConditions
    });

    return {
      servers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  },

  /**
   * Get all available categories for filtering
   */
  getCategories: async () => {
    return MCPServerRepository.getAllCategories();
  },

  /**
   * Get a single server by ID with all details
   */
  getServerById: async (id: string) => {
    return MCPServerRepository.findById(id);
  },

  /**
   * Get the total count of MCP servers in the registry
   */
  getServerCount: async () => {
    return MCPServerRepository.count({
      where: { isActive: true }
    });
  },

  /**
   * Get the total count of categories in the registry
   */
  getCategoryCount: async () => {
    return prisma.category.count();
  },

  /**
   * Get the total count of user contributions
   * For MVP, this is the sum of submitted servers and feedback
   */
  getContributionCount: async () => {
    // For now, just return a placeholder value
    // In a real implementation, this would count user submissions and feedback
    return 120; // Placeholder for MVP
  }
};

export default searchService; 