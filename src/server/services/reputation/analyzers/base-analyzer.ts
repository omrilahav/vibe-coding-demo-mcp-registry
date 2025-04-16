import { MCPServer } from '.prisma/client';
import { FactorAnalysisResult, FactorAnalyzer } from '../types';

export abstract class BaseFactorAnalyzer implements FactorAnalyzer {
  protected name: string;
  protected weight: number;

  constructor(name: string, weight: number) {
    this.name = name;
    this.weight = weight;
  }

  abstract analyze(server: MCPServer): Promise<FactorAnalysisResult>;

  getName(): string {
    return this.name;
  }

  getWeight(): number {
    return this.weight;
  }

  /**
   * Utility method to normalize a score to 0-100 range
   */
  protected normalizeScore(value: number, min: number, max: number): number {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return Math.round(((value - min) / (max - min)) * 100);
  }

  /**
   * Utility method to calculate confidence level based on data availability
   */
  protected calculateConfidence(data: any): number {
    if (!data) return 0;
    return 1; // Default full confidence if data exists
  }
} 