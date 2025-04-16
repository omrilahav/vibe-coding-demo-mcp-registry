// @ts-ignore - Import PrismaClient directly from .prisma/client
import { MCPServer, ReputationScore } from '.prisma/client';

// Types for factor analyzers
export interface FactorAnalysisResult {
  score: number;  // 0-100 normalized score
  confidence: number;  // 0-1 confidence level
  details?: Record<string, any>;  // Additional details specific to the factor
}

export interface FactorAnalyzer {
  analyze(server: MCPServer): Promise<FactorAnalysisResult>;
  getName(): string;
  getWeight(): number;
}

// Types for scoring engine
export interface ScoreCalculatorOptions {
  factorWeights?: Record<string, number>;
}

export interface ReputationScoreDetails {
  overallScore: number;
  factorScores: Record<string, FactorAnalysisResult>;
  calculatedAt: Date;
}

// Types for tracking history
export interface ScoreHistory {
  serverId: string;
  scores: ReputationScore[];
}

// Configuration for the scoring engine
export interface ReputationScoringConfig {
  factorWeights: Record<string, number>;
}

// Options for score calculation
export interface CalculateOptions {
  forceRecalculate?: boolean;
} 