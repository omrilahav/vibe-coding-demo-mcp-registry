import { Octokit } from '@octokit/rest';
// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient } from '.prisma/client';
import { SourceAdapter, MCPServerData } from '../types';

export class GitHubAdapter implements SourceAdapter {
  private octokit: Octokit;
  private prisma: PrismaClient;
  private dataSourceId?: string;

  constructor() {
    // Simple initialization - in a real app, you might want to get this from env or config
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.prisma = new PrismaClient();
  }

  getName(): string {
    return 'github';
  }

  private async getRepoMetrics(repoUrl: string): Promise<Partial<MCPServerData> | null> {
    try {
      // Extract owner and repo from URL
      // Example: https://github.com/owner/repo
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      if (urlParts.length < 2) return null;
      
      const owner = urlParts[0];
      const repo = urlParts[1];

      // Get repository data
      const { data: repoData } = await this.octokit.repos.get({
        owner,
        repo,
      });

      // Get contributors count
      const { data: contributors } = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 1, // We just need the count from headers
      });

      // Extract metrics
      return {
        name: repoData.name,
        description: repoData.description || undefined,
        url: repoData.homepage || repoUrl,
        repositoryUrl: repoUrl,
        license: repoData.license?.name,
        owner: repoData.owner.login,
        ownerType: repoData.owner.type.toLowerCase(),
        repoMetrics: {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.subscribers_count,
          lastCommitDate: new Date(repoData.pushed_at),
          openIssuesCount: repoData.open_issues_count,
          contributorsCount: contributors.length, // This is a simplification
        },
      };
    } catch (error) {
      console.error(`Error fetching repo metrics for ${repoUrl}:`, error);
      return null;
    }
  }

  async collect(): Promise<MCPServerData[]> {
    const results: MCPServerData[] = [];
    
    try {
      // Get all MCP servers with repository URLs from the database
      const servers = await this.prisma.mCPServer.findMany({
        where: {
          repositoryUrl: {
            not: null,
            contains: 'github.com', // Only GitHub repos
          },
        },
        select: {
          id: true,
          name: true,
          url: true,
          repositoryUrl: true,
        },
      });

      // Process each server in sequence to avoid rate limits
      for (const server of servers) {
        if (!server.repositoryUrl) continue;
        
        const repoData = await this.getRepoMetrics(server.repositoryUrl);
        
        if (repoData) {
          results.push({
            name: server.name,
            url: server.url,
            ...repoData,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in GitHub collection:', error);
      return results;
    }
  }

  async updateDataSource(): Promise<void> {
    try {
      // Get or create the GitHub data source
      const dataSource = await this.prisma.dataSource.upsert({
        where: { name: this.getName() },
        update: { 
          lastFetchedAt: new Date(),
          status: 'active',
          errorMessage: null,
        },
        create: {
          name: this.getName(),
          sourceType: 'github',
          baseUrl: 'https://api.github.com',
          status: 'active',
        }
      });
      
      this.dataSourceId = dataSource.id;
    } catch (error) {
      console.error('Error updating data source record:', error);
    }
  }
} 