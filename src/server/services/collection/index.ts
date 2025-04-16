import * as cron from 'node-cron';
// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient } from '.prisma/client';
import { getAdapters } from './adapters';
import { DataNormalizer } from './utils/normalizer';
import { CollectionOptions, MCPServerData } from './types';

export class DataCollectionService {
  private prisma: PrismaClient;
  private normalizer: DataNormalizer;
  private isCollecting: boolean = false;
  private cronJob?: cron.ScheduledTask;

  constructor() {
    this.prisma = new PrismaClient();
    this.normalizer = new DataNormalizer();
  }

  /**
   * Start the collection service
   */
  async start(): Promise<void> {
    // Check if we need to collect data on startup
    const shouldCollect = await this.shouldCollectOnStartup();
    if (shouldCollect) {
      await this.collectData();
    }

    // Set up scheduled collection (every 24 hours at 3 AM)
    this.cronJob = cron.schedule('0 3 * * *', async () => {
      await this.collectData();
    });
  }

  /**
   * Stop the collection service
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  /**
   * Manually trigger data collection
   */
  async triggerCollection(options?: CollectionOptions): Promise<void> {
    await this.collectData(options);
  }

  /**
   * Determine if we should collect data on startup
   */
  private async shouldCollectOnStartup(): Promise<boolean> {
    // Check if there are any MCP servers in the database
    const serverCount = await this.prisma.mCPServer.count();
    if (serverCount === 0) return true;

    // Check when the last collection was performed
    const latestDataSource = await this.prisma.dataSource.findFirst({
      orderBy: { lastFetchedAt: 'desc' },
    });

    // If no data source or last update was more than 24 hours ago
    if (!latestDataSource || !latestDataSource.lastFetchedAt) return true;

    const lastUpdate = new Date(latestDataSource.lastFetchedAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return lastUpdate < oneDayAgo;
  }

  /**
   * Collect data from all sources
   */
  private async collectData(options?: CollectionOptions): Promise<void> {
    // Prevent concurrent collection
    if (this.isCollecting) {
      console.log('Data collection already in progress');
      return;
    }

    this.isCollecting = true;

    try {
      console.log('Starting data collection...');

      // Get all adapters
      const adapters = getAdapters();
      const filteredAdapters = options?.sources 
        ? adapters.filter(a => options.sources?.includes(a.getName()))
        : adapters;

      // Collect data from each source
      const collectionPromises = filteredAdapters.map(async (adapter) => {
        try {
          // Update the data source record
          await adapter.updateDataSource();
          // Collect data
          return await adapter.collect();
        } catch (error) {
          console.error(`Error collecting from ${adapter.getName()}:`, error);
          return [];
        }
      });

      const collectedDataSets = await Promise.all(collectionPromises);
      
      // Normalize and merge data
      const normalizedData = this.normalizer.normalize(collectedDataSets);
      
      // Store in database
      await this.storeData(normalizedData.mcpServers);

      console.log('Data collection completed successfully');
    } catch (error) {
      console.error('Error in data collection process:', error);
    } finally {
      this.isCollecting = false;
    }
  }

  /**
   * Store the collected data in the database
   */
  private async storeData(servers: MCPServerData[]): Promise<void> {
    for (const server of servers) {
      await this.upsertServer(server);
    }
  }

  /**
   * Create or update a server record
   */
  private async upsertServer(server: MCPServerData): Promise<void> {
    try {
      // Find or create the MCP server
      const existingServer = await this.prisma.mCPServer.findFirst({
        where: { url: server.url },
      });

      if (existingServer) {
        // Update existing server
        await this.prisma.mCPServer.update({
          where: { id: existingServer.id },
          data: {
            name: server.name,
            description: server.description,
            repositoryUrl: server.repositoryUrl,
            license: server.license,
            owner: server.owner,
            ownerType: server.ownerType,
            lastScannedAt: new Date(),
          },
        });

        // Update categories
        if (server.categories && server.categories.length > 0) {
          await this.updateServerCategories(existingServer.id, server.categories);
        }

        // Update capabilities
        if (server.capabilities && server.capabilities.length > 0) {
          await this.updateServerCapabilities(existingServer.id, server.capabilities);
        }
      } else {
        // Create new server
        const newServer = await this.prisma.mCPServer.create({
          data: {
            name: server.name,
            description: server.description,
            url: server.url,
            repositoryUrl: server.repositoryUrl,
            license: server.license,
            owner: server.owner,
            ownerType: server.ownerType,
            lastScannedAt: new Date(),
          },
        });

        // Add categories
        if (server.categories && server.categories.length > 0) {
          await this.updateServerCategories(newServer.id, server.categories);
        }

        // Add capabilities
        if (server.capabilities && server.capabilities.length > 0) {
          await this.updateServerCapabilities(newServer.id, server.capabilities);
        }
      }
    } catch (error) {
      console.error(`Error upserting server ${server.name}:`, error);
    }
  }

  /**
   * Update a server's categories
   */
  private async updateServerCategories(serverId: string, categoryNames: string[]): Promise<void> {
    try {
      // First, remove existing categories
      await this.prisma.categoryToServer.deleteMany({
        where: { serverId },
      });

      // Then add new categories
      for (const categoryName of categoryNames) {
        // Find or create the category
        let category = await this.prisma.category.findFirst({
          where: { name: categoryName },
        });

        if (!category) {
          category = await this.prisma.category.create({
            data: { name: categoryName },
          });
        }

        // Create the relationship
        await this.prisma.categoryToServer.create({
          data: {
            serverId,
            categoryId: category.id,
          },
        });
      }
    } catch (error) {
      console.error(`Error updating categories for server ${serverId}:`, error);
    }
  }

  /**
   * Update a server's capabilities
   */
  private async updateServerCapabilities(serverId: string, capabilities: MCPServerData['capabilities'] = []): Promise<void> {
    try {
      // First, remove existing capabilities
      await this.prisma.capability.deleteMany({
        where: { serverId },
      });

      // Then add new capabilities
      for (const cap of capabilities) {
        await this.prisma.capability.create({
          data: {
            name: cap.name,
            description: cap.description,
            details: cap.details ? JSON.stringify(cap.details) : null,
            serverId,
          },
        });
      }
    } catch (error) {
      console.error(`Error updating capabilities for server ${serverId}:`, error);
    }
  }
}

// Create and export a singleton instance
const dataCollectionService = new DataCollectionService();
export default dataCollectionService; 