import { MCPServer } from '.prisma/client';
import { BaseFactorAnalyzer } from './base-analyzer';
import { FactorAnalysisResult } from '../types';
import axios from 'axios';

interface MaintenanceMetrics {
  lastCommitDate: Date | null;
  ageInDays: number;
  commitFrequency: number | null; // commits per month
  issueResponseTime?: number | null; // average days to response
}

export class MaintenanceFrequencyAnalyzer extends BaseFactorAnalyzer {
  private static readonly DEFAULT_WEIGHT = 0.25; // 25% weight in overall score

  constructor(weight: number = MaintenanceFrequencyAnalyzer.DEFAULT_WEIGHT) {
    super('maintenance', weight);
  }

  async analyze(server: MCPServer): Promise<FactorAnalysisResult> {
    if (!server.repositoryUrl || !this.isGitHubRepo(server.repositoryUrl)) {
      return {
        score: 0,
        confidence: 0,
        details: { message: 'No GitHub repository URL found for maintenance analysis' }
      };
    }

    try {
      const metrics = await this.fetchMaintenanceMetrics(server.repositoryUrl);
      return this.calculateScore(metrics);
    } catch (error) {
      console.error(`Error analyzing maintenance metrics for ${server.name}:`, error);
      return {
        score: 0,
        confidence: 0,
        details: { message: 'Error analyzing maintenance metrics', error: String(error) }
      };
    }
  }

  private isGitHubRepo(url: string): boolean {
    return url.includes('github.com');
  }

  private async fetchMaintenanceMetrics(repoUrl: string): Promise<MaintenanceMetrics> {
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
    const commitsEndpoint = `${repoEndpoint}/commits?per_page=100`;
    
    // Fetch repository data
    const { data: repoData } = await axios.get(repoEndpoint);
    const { data: commitsData } = await axios.get(commitsEndpoint);
    
    // Calculate age in days
    const createdAt = new Date(repoData.created_at);
    const now = new Date();
    const ageInDays = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate commit frequency (commits per month)
    let commitFrequency = null;
    if (commitsData.length > 0) {
      const oldestCommitInSample = new Date(commitsData[commitsData.length - 1].commit.author.date);
      const newestCommitInSample = new Date(commitsData[0].commit.author.date);
      
      const monthsBetween = this.monthsDifference(oldestCommitInSample, newestCommitInSample);
      if (monthsBetween > 0) {
        commitFrequency = commitsData.length / monthsBetween;
      } else {
        // If less than a month, calculate based on days
        const daysBetween = Math.max(1, (newestCommitInSample.getTime() - oldestCommitInSample.getTime()) / (1000 * 60 * 60 * 24));
        commitFrequency = (commitsData.length / daysBetween) * 30; // Normalize to monthly
      }
    }

    return {
      lastCommitDate: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
      ageInDays,
      commitFrequency
    };
  }

  private monthsDifference(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months + date2.getMonth() - date1.getMonth();
  }

  private calculateScore(metrics: MaintenanceMetrics): FactorAnalysisResult {
    // Calculate individual metric scores
    const activityScore = this.calculateActivityScore(metrics.lastCommitDate);
    const commitFrequencyScore = this.calculateCommitFrequencyScore(metrics.commitFrequency, metrics.ageInDays);
    const projectMaturityScore = this.calculateProjectMaturityScore(metrics.ageInDays);
    
    // Combine scores with appropriate weights
    const score = Math.round(
      (activityScore * 0.5) + 
      (commitFrequencyScore * 0.3) + 
      (projectMaturityScore * 0.2)
    );
    
    return {
      score,
      confidence: metrics.commitFrequency !== null ? 1.0 : 0.7,
      details: {
        metrics,
        subscores: {
          activityScore,
          commitFrequencyScore,
          projectMaturityScore
        }
      }
    };
  }

  private calculateActivityScore(lastCommitDate: Date | null): number {
    if (!lastCommitDate) return 0;
    
    const now = new Date();
    const daysAgo = (now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score decreases as time since last commit increases
    if (daysAgo < 7) return 100;   // Updated within the last week
    if (daysAgo < 30) return 90;   // Updated within the last month
    if (daysAgo < 90) return 70;   // Updated within the last 3 months
    if (daysAgo < 180) return 50;  // Updated within the last 6 months
    if (daysAgo < 365) return 30;  // Updated within the last year
    return 10; // Not updated in over a year
  }

  private calculateCommitFrequencyScore(commitsPerMonth: number | null, ageInDays: number): number {
    if (commitsPerMonth === null) return 50; // Default score if we can't calculate
    
    // New projects might have high initial commit frequency but not be maintained long-term
    const ageAdjustment = Math.min(1, ageInDays / 365); // Projects under 1 year get reduced weight
    
    // Score based on monthly commit frequency
    let baseScore;
    if (commitsPerMonth >= 30) baseScore = 100; // Very active: 1+ commit per day
    else if (commitsPerMonth >= 15) baseScore = 90; // Quite active: 3-4 commits per week
    else if (commitsPerMonth >= 8) baseScore = 80; // Active: 2 commits per week
    else if (commitsPerMonth >= 4) baseScore = 70; // Regular: 1 commit per week
    else if (commitsPerMonth >= 2) baseScore = 60; // Somewhat regular: biweekly commits
    else if (commitsPerMonth >= 1) baseScore = 50; // Monthly commits
    else if (commitsPerMonth >= 0.5) baseScore = 40; // Bi-monthly commits
    else if (commitsPerMonth >= 0.25) baseScore = 30; // Quarterly commits
    else baseScore = 20; // Rarely updated
    
    // Apply age adjustment for newer projects
    return Math.round(baseScore * (0.7 + (0.3 * ageAdjustment)));
  }

  private calculateProjectMaturityScore(ageInDays: number): number {
    // Calculate project maturity based on age
    // Brand new projects might not be stable, but very old abandoned projects are also problematic
    
    // Convert to years for easier calculation
    const ageInYears = ageInDays / 365;
    
    if (ageInYears < 0.25) return 50; // Very new projects (< 3 months)
    if (ageInYears < 0.5) return 60;  // New projects (3-6 months)
    if (ageInYears < 1) return 70;    // Established for ~1 year
    if (ageInYears < 2) return 80;    // Established for 1-2 years
    if (ageInYears < 5) return 90;    // Mature project (2-5 years)
    if (ageInYears < 8) return 100;   // Long-standing project (5-8 years)
    if (ageInYears < 10) return 90;   // Older project (8-10 years)
    return 80; // Very old project (> 10 years) - might use older practices but proven stable
  }
} 