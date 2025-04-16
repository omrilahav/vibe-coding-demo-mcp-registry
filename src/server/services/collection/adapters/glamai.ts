import axios from 'axios';
import * as cheerio from 'cheerio';
// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient } from '.prisma/client';
import { SourceAdapter, MCPServerData } from '../types';

export class GlamaAdapter implements SourceAdapter {
  private baseUrl = 'https://glama.ai/mcp-directory'; // Example URL
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
    
    try {
      // Fetch the directory page
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      
      // Select all server cards/entries
      $('.server-card').each((_, element) => {
        // Simple scraping implementation
        const name = $(element).find('.server-name').text().trim();
        const description = $(element).find('.server-description').text().trim();
        const url = $(element).find('.server-url').attr('href') || '';
        const repoUrl = $(element).find('.repo-url').attr('href');
        
        // Extract categories
        const categories: string[] = [];
        $(element).find('.category-tag').each((_, categoryEl) => {
          categories.push($(categoryEl).text().trim());
        });
        
        // Extract capabilities
        const capabilities: MCPServerData['capabilities'] = [];
        $(element).find('.capability-item').each((_, capEl) => {
          capabilities.push({
            name: $(capEl).find('.capability-name').text().trim(),
            description: $(capEl).find('.capability-description').text().trim(),
          });
        });
        
        if (name && url) {
          results.push({
            name,
            description,
            url,
            repositoryUrl: repoUrl,
            categories,
            capabilities,
          });
        }
      });
      
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
          sourceType: 'web_scraping',
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