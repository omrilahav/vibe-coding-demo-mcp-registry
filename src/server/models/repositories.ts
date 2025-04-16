import { prisma } from './database';
import type { 
  MCPServer, 
  ReputationScore,
  Category,
  UserContribution,
  DataSource,
  Capability
} from '@prisma/client';

/**
 * MCP Server Repository
 */
export const MCPServerRepository = {
  /**
   * Creates a new MCP server
   */
  create: (data: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.mCPServer.create({
      data
    });
  },

  /**
   * Finds a server by ID
   */
  findById: (id: string) => {
    return prisma.mCPServer.findUnique({
      where: { id },
      include: {
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        categories: {
          include: {
            category: true
          }
        },
        capabilities: true
      }
    });
  },

  /**
   * Updates a server by ID
   */
  update: (id: string, data: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return prisma.mCPServer.update({
      where: { id },
      data
    });
  },

  /**
   * Deletes a server by ID
   */
  delete: (id: string) => {
    return prisma.mCPServer.delete({
      where: { id }
    });
  },

  /**
   * Lists all servers with optional filtering and pagination
   */
  findAll: (params?: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
  }) => {
    return prisma.mCPServer.findMany({
      ...params,
      include: {
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  },

  /**
   * Searches for servers by name, description, or url
   */
  search: (query: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }) => {
    const searchCondition = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { url: { contains: query } }
      ]
    };

    return prisma.mCPServer.findMany({
      where: searchCondition,
      ...params,
      include: {
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  },

  /**
   * Finds servers by category
   */
  findByCategory: (categoryId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }) => {
    return prisma.mCPServer.findMany({
      where: {
        categories: {
          some: {
            categoryId
          }
        }
      },
      ...params,
      include: {
        reputationScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  },

  /**
   * Counts servers based on filtering criteria
   */
  count: (params?: {
    where?: any;
  }) => {
    return prisma.mCPServer.count({
      ...params
    });
  },

  /**
   * Gets all categories for filtering
   */
  getAllCategories: () => {
    return prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }
};

/**
 * Reputation Score Repository
 */
export const ReputationScoreRepository = {
  /**
   * Creates a new reputation score
   */
  create: (data: Omit<ReputationScore, 'id' | 'calculatedAt'>) => {
    return prisma.reputationScore.create({
      data
    });
  },

  /**
   * Finds the latest reputation score for a server
   */
  findLatestByServerId: (serverId: string) => {
    return prisma.reputationScore.findFirst({
      where: { serverId },
      orderBy: { calculatedAt: 'desc' }
    });
  },

  /**
   * Gets historical reputation scores for a server
   */
  getHistoricalScores: (serverId: string, limit: number = 10) => {
    return prisma.reputationScore.findMany({
      where: { serverId },
      orderBy: { calculatedAt: 'desc' },
      take: limit
    });
  }
};

/**
 * User Contribution Repository
 */
export const UserContributionRepository = {
  /**
   * Creates a new user contribution
   */
  create: (data: Omit<UserContribution, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.userContribution.create({
      data
    });
  },

  /**
   * Finds a user contribution by ID
   */
  findById: (id: string) => {
    return prisma.userContribution.findUnique({
      where: { id },
      include: {
        server: true
      }
    });
  },

  /**
   * Updates a user contribution
   */
  update: (id: string, data: Partial<Omit<UserContribution, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return prisma.userContribution.update({
      where: { id },
      data
    });
  },

  /**
   * Lists all user contributions with filtering
   */
  findAll: (params?: {
    status?: string;
    contributionType?: string;
    serverId?: string;
    skip?: number;
    take?: number;
  }) => {
    const { status, contributionType, serverId, skip, take } = params || {};

    return prisma.userContribution.findMany({
      where: {
        ...(status && { status }),
        ...(contributionType && { contributionType }),
        ...(serverId && { serverId })
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        server: true
      }
    });
  },

  /**
   * Counts pending contributions
   */
  countPending: () => {
    return prisma.userContribution.count({
      where: { status: 'pending' }
    });
  }
};

/**
 * Category Repository
 */
export const CategoryRepository = {
  /**
   * Creates a new category
   */
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.category.create({
      data
    });
  },

  /**
   * Finds a category by ID
   */
  findById: (id: string) => {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true
      }
    });
  },

  /**
   * Lists all categories
   */
  findAll: (includeServersCount: boolean = false) => {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        ...(includeServersCount && {
          _count: {
            select: { servers: true }
          }
        })
      }
    });
  },

  /**
   * Gets all root categories (no parent)
   */
  findRootCategories: () => {
    return prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { servers: true }
        }
      }
    });
  },

  /**
   * Associates a server with a category
   */
  addServerToCategory: (serverId: string, categoryId: string) => {
    return prisma.categoryToServer.create({
      data: {
        serverId,
        categoryId
      }
    });
  },

  /**
   * Removes a server from a category
   */
  removeServerFromCategory: (serverId: string, categoryId: string) => {
    return prisma.categoryToServer.delete({
      where: {
        serverId_categoryId: {
          serverId,
          categoryId
        }
      }
    });
  }
};

/**
 * Data Source Repository
 */
export const DataSourceRepository = {
  /**
   * Creates a new data source
   */
  create: (data: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.dataSource.create({
      data
    });
  },

  /**
   * Finds a data source by name
   */
  findByName: (name: string) => {
    return prisma.dataSource.findUnique({
      where: { name }
    });
  },

  /**
   * Updates a data source
   */
  update: (id: string, data: Partial<Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return prisma.dataSource.update({
      where: { id },
      data
    });
  },

  /**
   * Lists all data sources
   */
  findAll: () => {
    return prisma.dataSource.findMany({
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Updates the last fetched timestamp for a data source
   */
  updateLastFetched: (id: string, status: string = 'active', errorMessage?: string) => {
    return prisma.dataSource.update({
      where: { id },
      data: {
        lastFetchedAt: new Date(),
        status,
        ...(errorMessage && { errorMessage }),
        ...(errorMessage === null && { errorMessage: null })
      }
    });
  }
};

/**
 * Capability Repository
 */
export const CapabilityRepository = {
  /**
   * Creates a new capability
   */
  create: (data: Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>) => {
    return prisma.capability.create({
      data
    });
  },

  /**
   * Finds capabilities by server ID
   */
  findByServerId: (serverId: string) => {
    return prisma.capability.findMany({
      where: { serverId }
    });
  },

  /**
   * Updates a capability
   */
  update: (id: string, data: Partial<Omit<Capability, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return prisma.capability.update({
      where: { id },
      data
    });
  },

  /**
   * Deletes a capability
   */
  delete: (id: string) => {
    return prisma.capability.delete({
      where: { id }
    });
  }
}; 