import { MCPServer } from '.prisma/client';
import { BaseFactorAnalyzer } from './base-analyzer';
import { FactorAnalysisResult } from '../types';
import axios from 'axios';

interface OpenSourceMetrics {
  hasPublicRepository: boolean;
  hasReadme: boolean;
  readmeQualityScore: number; // 0-100
  hasDocs: boolean;
  hasLicense: boolean;
  licenseType: string | null;
  hasContributing: boolean;
  hasCommunityEngagement: boolean;
}

export class OpenSourceStatusAnalyzer extends BaseFactorAnalyzer {
  private static readonly DEFAULT_WEIGHT = 0.20; // 20% weight in overall score

  constructor(weight: number = OpenSourceStatusAnalyzer.DEFAULT_WEIGHT) {
    super('opensource', weight);
  }

  async analyze(server: MCPServer): Promise<FactorAnalysisResult> {
    if (!server.repositoryUrl) {
      return {
        score: 0,
        confidence: 0.5,
        details: { message: 'No repository URL found' }
      };
    }

    try {
      const metrics = await this.fetchOpenSourceMetrics(server);
      return this.calculateScore(metrics);
    } catch (error) {
      console.error(`Error analyzing open source status for ${server.name}:`, error);
      return {
        score: 0,
        confidence: 0,
        details: { message: 'Error analyzing open source status', error: String(error) }
      };
    }
  }

  private async fetchOpenSourceMetrics(server: MCPServer): Promise<OpenSourceMetrics> {
    // Default metrics if no repository is available
    const defaultMetrics: OpenSourceMetrics = {
      hasPublicRepository: false,
      hasReadme: false,
      readmeQualityScore: 0,
      hasDocs: false,
      hasLicense: !!server.license,
      licenseType: server.license || null,
      hasContributing: false,
      hasCommunityEngagement: false
    };

    // If not a GitHub repository, use limited data
    if (!server.repositoryUrl || !this.isGitHubRepo(server.repositoryUrl)) {
      return {
        ...defaultMetrics,
        hasPublicRepository: !!server.repositoryUrl,
        hasLicense: !!server.license,
        licenseType: server.license || null
      };
    }

    // Extract owner/repo from GitHub URL
    const urlParts = server.repositoryUrl.split('github.com/')[1];
    if (!urlParts) return defaultMetrics;

    const [owner, repo] = urlParts.split('/');
    if (!owner || !repo) return defaultMetrics;

    // Clean up repo name (remove .git suffix if present)
    const cleanRepo = repo.replace('.git', '');

    // GitHub API endpoints
    const repoEndpoint = `https://api.github.com/repos/${owner}/${cleanRepo}`;
    const contentsEndpoint = `${repoEndpoint}/contents`;
    
    // Fetch repository data
    const { data: repoData } = await axios.get(repoEndpoint);
    const { data: contentsData } = await axios.get(contentsEndpoint);
    
    // Check for README
    let hasReadme = false;
    let readmeQualityScore = 0;
    const readmeFile = contentsData.find((item: any) => 
      item.name.toLowerCase().includes('readme')
    );
    
    if (readmeFile) {
      hasReadme = true;
      const { data: readmeData } = await axios.get(readmeFile.download_url);
      readmeQualityScore = this.evaluateReadmeQuality(readmeData);
    }
    
    // Check for documentation
    const hasDocs = contentsData.some((item: any) => 
      item.type === 'dir' && (
        item.name.toLowerCase() === 'docs' || 
        item.name.toLowerCase() === 'documentation'
      )
    );
    
    // Check for CONTRIBUTING guide
    const hasContributing = contentsData.some((item: any) => 
      item.name.toLowerCase().includes('contributing')
    );
    
    // Determine community engagement based on issues, PRs, and discussions
    const hasCommunityEngagement = repoData.has_issues || 
                                 repoData.has_projects || 
                                 repoData.has_wiki || 
                                 repoData.has_discussions;
    
    return {
      hasPublicRepository: true,
      hasReadme,
      readmeQualityScore,
      hasDocs,
      hasLicense: !!repoData.license || !!server.license,
      licenseType: (repoData.license?.spdx_id || repoData.license?.name || server.license || null),
      hasContributing,
      hasCommunityEngagement
    };
  }

  private isGitHubRepo(url: string): boolean {
    return url.includes('github.com');
  }

  private evaluateReadmeQuality(content: string): number {
    if (!content) return 0;
    
    let score = 0;
    const totalPossible = 100;
    
    // Check length - longer READMEs tend to be more informative
    const length = content.length;
    if (length > 5000) score += 25;
    else if (length > 2000) score += 20;
    else if (length > 1000) score += 15;
    else if (length > 500) score += 10;
    else score += 5;
    
    // Check for sections with headings
    const headingCount = (content.match(/#{1,6} /g) || []).length;
    if (headingCount >= 5) score += 20;
    else if (headingCount >= 3) score += 15;
    else if (headingCount >= 1) score += 10;
    
    // Check for code examples
    const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
    if (codeBlockCount >= 3) score += 15;
    else if (codeBlockCount >= 1) score += 10;
    
    // Check for images or diagrams
    const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    if (imageCount >= 2) score += 10;
    else if (imageCount >= 1) score += 5;
    
    // Check for links
    const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length - imageCount;
    if (linkCount >= 5) score += 15;
    else if (linkCount >= 3) score += 10;
    else if (linkCount >= 1) score += 5;
    
    // Check for installation instructions
    if (content.toLowerCase().includes('install') || 
        content.toLowerCase().includes('getting started')) {
      score += 15;
    }
    
    return Math.min(100, score);
  }

  private calculateScore(metrics: OpenSourceMetrics): FactorAnalysisResult {
    // Base score starts at 0
    let score = 0;
    let confidence = 0.8; // Default confidence level
    
    // Public repository is mandatory for a good open source score
    if (metrics.hasPublicRepository) {
      score += 20;
      
      // Documentation
      if (metrics.hasReadme) {
        score += 10 + Math.round(metrics.readmeQualityScore * 0.2); // Up to 30 points for an excellent README
      }
      
      if (metrics.hasDocs) {
        score += 15;
      }
      
      // License
      if (metrics.hasLicense) {
        score += 15;
        
        // Bonus for recognized open source licenses
        if (this.isOpenSourceLicense(metrics.licenseType)) {
          score += 5;
        }
      }
      
      // Community aspects
      if (metrics.hasContributing) {
        score += 10;
      }
      
      if (metrics.hasCommunityEngagement) {
        score += 5;
      }
      
      confidence = 1.0;
    } else {
      // Limited data available
      score = metrics.hasLicense ? 30 : 10;
      confidence = 0.5;
    }
    
    // Cap at 100
    score = Math.min(100, score);
    
    return {
      score,
      confidence,
      details: {
        metrics
      }
    };
  }

  private isOpenSourceLicense(license: string | null): boolean {
    if (!license) return false;
    
    const licenseUpperCase = license.toUpperCase();
    
    // Common open source licenses
    const openSourceLicenses = [
      'MIT', 'APACHE', 'GPL', 'BSD', 'LGPL', 'MPL', 'CDDL', 'EPL', 
      'MS-PL', 'CPL', 'AGPL', 'EUPL', 'CC0', 'UNLICENSE', 'WTFPL'
    ];
    
    return openSourceLicenses.some(l => licenseUpperCase.includes(l));
  }
} 