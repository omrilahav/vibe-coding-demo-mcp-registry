import axios from 'axios';
import { MCPServer } from '.prisma/client';
import { BaseFactorAnalyzer } from './base-analyzer';
import { FactorAnalysisResult } from '../types';

interface GitHubMetrics {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  lastCommitDate: Date | null;
  contributorsCount: number;
}

export class GitHubMetricsAnalyzer extends BaseFactorAnalyzer {
  private static readonly DEFAULT_WEIGHT = 0.35; // 35% weight in overall score

  constructor(weight: number = GitHubMetricsAnalyzer.DEFAULT_WEIGHT) {
    super('github', weight);
  }

  async analyze(server: MCPServer): Promise<FactorAnalysisResult> {
    if (!server.repositoryUrl || !this.isGitHubRepo(server.repositoryUrl)) {
      return {
        score: 0,
        confidence: 0,
        details: { message: 'No GitHub repository URL found' }
      };
    }

    try {
      const metrics = await this.fetchGitHubMetrics(server.repositoryUrl);
      return this.calculateScore(metrics);
    } catch (error) {
      console.error(`Error analyzing GitHub metrics for ${server.name}:`, error);
      return {
        score: 0,
        confidence: 0,
        details: { message: 'Error analyzing GitHub metrics', error: String(error) }
      };
    }
  }

  private isGitHubRepo(url: string): boolean {
    return url.includes('github.com');
  }

  private async fetchGitHubMetrics(repoUrl: string): Promise<GitHubMetrics> {
    // Extract owner/repo from GitHub URL
    const urlParts = repoUrl.split('github.com/')[1];
    if (!urlParts) {
      throw new Error(`Invalid GitHub URL: ${repoUrl}`);
    }

    const [owner, repo] = urlParts.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid GitHub URL format: ${repoUrl}`);
    }

    // Clean up repo name (remove .git suffix if present)
    const cleanRepo = repo.replace('.git', '');

    // GitHub API endpoints
    const repoEndpoint = `https://api.github.com/repos/${owner}/${cleanRepo}`;
    const contributorsEndpoint = `${repoEndpoint}/contributors?per_page=1&anon=1`;
    
    // Fetch repository data
    const { data: repoData } = await axios.get(repoEndpoint);
    
    // Get total contributor count
    const { headers: contributorsHeaders } = await axios.get(contributorsEndpoint);
    const contributorsCount = this.extractTotalCount(contributorsHeaders);

    // Extract and return metrics
    return {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      watchers: repoData.subscribers_count || 0,
      openIssues: repoData.open_issues_count || 0,
      lastCommitDate: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
      contributorsCount
    };
  }

  private extractTotalCount(headers: any): number {
    // GitHub returns pagination info in the Link header
    const linkHeader = headers.link || '';
    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : 1;
  }

  private calculateScore(metrics: GitHubMetrics): FactorAnalysisResult {
    // Calculate individual metric scores
    const starScore = this.normalizeScore(metrics.stars, 0, 1000);
    const forkScore = this.normalizeScore(metrics.forks, 0, 300);
    const watcherScore = this.normalizeScore(metrics.watchers, 0, 100);
    const contributorScore = this.normalizeScore(metrics.contributorsCount, 1, 50);
    
    // Calculate activity score based on last commit date
    const activityScore = this.calculateActivityScore(metrics.lastCommitDate);
    
    // Calculate open issues score (balanced - too many or too few can be bad)
    const issueScore = this.calculateIssueScore(metrics.openIssues, metrics.stars);
    
    // Combine scores with appropriate weights
    const score = Math.round(
      (starScore * 0.25) + 
      (forkScore * 0.2) + 
      (watcherScore * 0.1) + 
      (contributorScore * 0.15) + 
      (activityScore * 0.25) + 
      (issueScore * 0.05)
    );
    
    return {
      score,
      confidence: 1.0,
      details: {
        metrics,
        subscores: {
          starScore,
          forkScore,
          watcherScore,
          contributorScore,
          activityScore,
          issueScore
        }
      }
    };
  }

  private calculateActivityScore(lastCommitDate: Date | null): number {
    if (!lastCommitDate) return 0;
    
    const now = new Date();
    const monthsAgo = (now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Score decreases as time since last commit increases
    if (monthsAgo < 1) return 100; // Updated within the last month
    if (monthsAgo < 3) return 80;  // Updated within the last 3 months
    if (monthsAgo < 6) return 60;  // Updated within the last 6 months
    if (monthsAgo < 12) return 40; // Updated within the last year
    if (monthsAgo < 24) return 20; // Updated within the last 2 years
    return 0; // Not updated in over 2 years
  }

  private calculateIssueScore(openIssues: number, stars: number): number {
    // Calculate issue ratio relative to project popularity
    const ratio = stars > 0 ? openIssues / stars : 0;
    
    // Too few issues might indicate low activity,
    // Too many might indicate poor maintenance,
    // A balanced ratio is ideal
    if (ratio === 0) return 50; // No issues could be good or bad
    if (ratio < 0.05) return 90; // Healthy ratio
    if (ratio < 0.1) return 80;
    if (ratio < 0.2) return 70;
    if (ratio < 0.3) return 60;
    if (ratio < 0.5) return 40;
    return 20; // Too many issues compared to stars
  }
} 