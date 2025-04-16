import { MCPServer } from '.prisma/client';
import { BaseFactorAnalyzer } from './base-analyzer';
import { FactorAnalysisResult } from '../types';
import axios from 'axios';

interface LicenseMetrics {
  licenseType: string | null;
  isOpenSource: boolean;
  permissiveness: number; // 0-100, higher is more permissive
  popularity: number; // 0-100, higher is more popular
  compatibility: number; // 0-100, higher is more compatible
  validLicense: boolean;
}

export class LicenseTypeAnalyzer extends BaseFactorAnalyzer {
  private static readonly DEFAULT_WEIGHT = 0.20; // 20% weight in overall score

  // License data for evaluation
  private readonly licenseData: Record<string, {
    isOpenSource: boolean;
    permissiveness: number; // 0-100
    popularity: number; // 0-100
    compatibility: number; // 0-100
  }> = {
    'MIT': { isOpenSource: true, permissiveness: 95, popularity: 95, compatibility: 95 },
    'APACHE-2.0': { isOpenSource: true, permissiveness: 90, popularity: 90, compatibility: 90 },
    'GPL-3.0': { isOpenSource: true, permissiveness: 50, popularity: 80, compatibility: 60 },
    'GPL-2.0': { isOpenSource: true, permissiveness: 50, popularity: 85, compatibility: 60 },
    'BSD-3-CLAUSE': { isOpenSource: true, permissiveness: 85, popularity: 80, compatibility: 90 },
    'BSD-2-CLAUSE': { isOpenSource: true, permissiveness: 90, popularity: 75, compatibility: 95 },
    'LGPL-3.0': { isOpenSource: true, permissiveness: 65, popularity: 70, compatibility: 75 },
    'LGPL-2.1': { isOpenSource: true, permissiveness: 65, popularity: 70, compatibility: 75 },
    'MPL-2.0': { isOpenSource: true, permissiveness: 70, popularity: 65, compatibility: 80 },
    'AGPL-3.0': { isOpenSource: true, permissiveness: 40, popularity: 60, compatibility: 50 },
    'UNLICENSE': { isOpenSource: true, permissiveness: 100, popularity: 60, compatibility: 90 },
    'CC0-1.0': { isOpenSource: true, permissiveness: 100, popularity: 70, compatibility: 90 },
    'CC-BY-4.0': { isOpenSource: true, permissiveness: 80, popularity: 75, compatibility: 80 },
    'CC-BY-SA-4.0': { isOpenSource: true, permissiveness: 60, popularity: 70, compatibility: 70 },
    'PROPRIETARY': { isOpenSource: false, permissiveness: 20, popularity: 50, compatibility: 30 },
    'CUSTOM': { isOpenSource: true, permissiveness: 50, popularity: 40, compatibility: 50 },
  };

  constructor(weight: number = LicenseTypeAnalyzer.DEFAULT_WEIGHT) {
    super('license', weight);
  }

  async analyze(server: MCPServer): Promise<FactorAnalysisResult> {
    try {
      const licenseType = await this.detectLicense(server);
      const metrics = this.evaluateLicense(licenseType);
      return this.calculateScore(metrics);
    } catch (error) {
      console.error(`Error analyzing license for ${server.name}:`, error);
      return {
        score: 0,
        confidence: 0,
        details: { message: 'Error analyzing license', error: String(error) }
      };
    }
  }

  private async detectLicense(server: MCPServer): Promise<string | null> {
    // If we already have a license in server data, use it
    if (server.license) {
      return server.license;
    }

    // Try to fetch license from GitHub if available
    if (server.repositoryUrl && this.isGitHubRepo(server.repositoryUrl)) {
      try {
        const licenseType = await this.fetchGitHubLicense(server.repositoryUrl);
        if (licenseType) {
          return licenseType;
        }
      } catch (error) {
        console.warn(`Could not fetch GitHub license for ${server.name}:`, error);
      }
    }

    // If we can't detect a license, return null
    return null;
  }

  private isGitHubRepo(url: string): boolean {
    return url.includes('github.com');
  }

  private async fetchGitHubLicense(repoUrl: string): Promise<string | null> {
    const urlParts = repoUrl.split('github.com/')[1];
    if (!urlParts) return null;

    const [owner, repo] = urlParts.split('/');
    if (!owner || !repo) return null;

    // Clean up repo name (remove .git suffix if present)
    const cleanRepo = repo.replace('.git', '');

    try {
      // GitHub API endpoints
      const repoEndpoint = `https://api.github.com/repos/${owner}/${cleanRepo}`;
      const { data: repoData } = await axios.get(repoEndpoint);
      
      if (repoData.license) {
        return repoData.license.spdx_id || repoData.license.key || repoData.license.name;
      }
    } catch (error) {
      console.error('Error fetching GitHub license:', error);
    }
    
    return null;
  }

  private evaluateLicense(licenseType: string | null): LicenseMetrics {
    if (!licenseType) {
      return {
        licenseType: null,
        isOpenSource: false,
        permissiveness: 0,
        popularity: 0,
        compatibility: 0,
        validLicense: false
      };
    }

    // Normalize license type for lookup
    const normalizedLicense = this.normalizeLicenseType(licenseType);
    
    // Find in our license database
    const licenseInfo = this.getLicenseInfo(normalizedLicense);
    
    return {
      licenseType,
      isOpenSource: licenseInfo.isOpenSource,
      permissiveness: licenseInfo.permissiveness,
      popularity: licenseInfo.popularity,
      compatibility: licenseInfo.compatibility,
      validLicense: true
    };
  }

  private normalizeLicenseType(license: string): string {
    // Normalize license format for lookup
    const upperLicense = license.toUpperCase()
      .replace(/\s+/g, '-')
      .replace(/LICENSE/i, '')
      .replace(/V(\d)/i, '-$1')
      .replace(/VERSION-(\d)/i, '-$1')
      .replace(/^THE-/, '')
      .trim();
    
    // Handle specific cases
    if (upperLicense.includes('MIT')) return 'MIT';
    if (upperLicense.includes('APACHE')) return 'APACHE-2.0';
    if (upperLicense.includes('GPL-3')) return 'GPL-3.0';
    if (upperLicense.includes('GPL-2')) return 'GPL-2.0';
    if (upperLicense.includes('LGPL-3')) return 'LGPL-3.0';
    if (upperLicense.includes('LGPL-2')) return 'LGPL-2.1';
    if (upperLicense.includes('BSD-3')) return 'BSD-3-CLAUSE';
    if (upperLicense.includes('BSD-2')) return 'BSD-2-CLAUSE';
    if (upperLicense.includes('MPL')) return 'MPL-2.0';
    if (upperLicense.includes('AGPL')) return 'AGPL-3.0';
    if (upperLicense.includes('UNLICENSE')) return 'UNLICENSE';
    if (upperLicense.includes('CC0')) return 'CC0-1.0';
    if (upperLicense.includes('CC-BY-SA')) return 'CC-BY-SA-4.0';
    if (upperLicense.includes('CC-BY')) return 'CC-BY-4.0';
    if (upperLicense.includes('PROPRIETARY')) return 'PROPRIETARY';
    
    return 'CUSTOM';
  }

  private getLicenseInfo(normalizedLicense: string) {
    // Return license data if we have it
    if (this.licenseData[normalizedLicense]) {
      return this.licenseData[normalizedLicense];
    }
    
    // For unknown licenses, return "CUSTOM" evaluation
    return this.licenseData['CUSTOM'];
  }

  private calculateScore(metrics: LicenseMetrics): FactorAnalysisResult {
    if (!metrics.licenseType || !metrics.validLicense) {
      return {
        score: 0,
        confidence: 0.3,
        details: { 
          message: 'No valid license found',
          metrics 
        }
      };
    }

    // Calculate score based on license metrics
    // Weight permissiveness, popularity, and compatibility
    const score = Math.round(
      (metrics.permissiveness * 0.4) +
      (metrics.popularity * 0.3) +
      (metrics.compatibility * 0.3)
    );
    
    return {
      score,
      confidence: 0.9,
      details: {
        metrics,
        license: metrics.licenseType
      }
    };
  }
} 