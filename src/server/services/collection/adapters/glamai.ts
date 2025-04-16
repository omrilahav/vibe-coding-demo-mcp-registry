import axios, { AxiosResponse } from 'axios';
// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient } from '.prisma/client';
import { SourceAdapter, MCPServerData } from '../types';

export class GlamaAdapter implements SourceAdapter {
  private baseUrl = 'https://glama.ai/api/mcp/v1/servers';
  private prisma: PrismaClient;
  private dataSourceId?: string;

  constructor() {
    this.prisma = new PrismaClient();
  }

  getName(): string {
    return 'glama.ai';
  }

  async collect(): Promise<MCPServerData[]> {
    const results: MCPServerData[] = [];
    let hasNextPage = true;
    let endCursor: string | null = null;
    const fetchLimit = 20; // Number of servers to fetch per request
    let fetchCount = 0;
    const maxFetches = 3; // Limit number of API calls to avoid rate limiting
    
    try {
      while (hasNextPage && fetchCount < maxFetches) {
        fetchCount++;
        // Construct URL with pagination
        const url = endCursor 
          ? `${this.baseUrl}?first=${fetchLimit}&after=${encodeURIComponent(endCursor)}`
          : `${this.baseUrl}?first=${fetchLimit}`;
        
        console.log(`Fetching MCP servers from ${url}`);
        const response: AxiosResponse<any> = await axios.get(url);
        const data = response.data;
        
        // Validate response structure
        if (!data || !data.servers || !Array.isArray(data.servers)) {
          console.error('Unexpected API response format:', JSON.stringify(data).substring(0, 200));
          break;
        }
        
        console.log(`Retrieved ${data.servers.length} servers from Glama API`);
        
        // Process server data
        for (const server of data.servers) {
          try {
            // Map server data to our format
            const serverData: MCPServerData = {
              name: server.name || '',
              description: server.description || '',
              url: server.url || '',
              repositoryUrl: server.repository?.url || '',
              license: server.spdxLicense?.name || '',
              owner: '', // Not directly provided in the API
              ownerType: '', // Not directly provided in the API
              categories: [],
              capabilities: []
            };
            
            // Extract attributes as categories if available
            if (Array.isArray(server.attributes)) {
              serverData.categories = server.attributes;
            }
            
            // Add tools as capabilities if available
            if (Array.isArray(server.tools)) {
              serverData.capabilities = server.tools.map((tool: any) => ({
                name: tool.name || '',
                description: tool.description || '',
                details: tool
              }));
            }
            
            // Only add valid servers
            if (serverData.name && serverData.url) {
              results.push(serverData);
            }
          } catch (err) {
            console.error('Error processing server:', err);
          }
        }
        
        // Check for pagination
        if (data.pageInfo && data.pageInfo.hasNextPage && data.pageInfo.endCursor) {
          hasNextPage = data.pageInfo.hasNextPage;
          endCursor = data.pageInfo.endCursor;
          console.log(`More data available, next cursor: ${endCursor?.substring(0, 20) || ''}...`);
        } else {
          hasNextPage = false;
        }
      }
      
      console.log(`Successfully collected ${results.length} MCP servers from Glama.ai`);
      return results;
    } catch (error) {
      console.error('Error in Glama.ai collection:', error);
      return results;
    }
  }

  async updateDataSource(): Promise<void> {
    try {
      // Get or create the Glama.ai data source
      const dataSource = await this.prisma.dataSource.upsert({
        where: { name: this.getName() },
        update: { 
          lastFetchedAt: new Date(),
          status: 'active',
          errorMessage: null,
        },
        create: {
          name: this.getName(),
          sourceType: 'api',
          baseUrl: this.baseUrl,
          status: 'active',
        }
      });
      
      this.dataSourceId = dataSource.id;
    } catch (error) {
      console.error('Error updating data source record:', error);
    }
  }
} 