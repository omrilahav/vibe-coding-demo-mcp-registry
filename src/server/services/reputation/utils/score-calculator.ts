import { FactorAnalysisResult, FactorAnalyzer, ReputationScoreDetails, ScoreCalculatorOptions } from '../types';
import { MCPServer } from '.prisma/client';

export class ScoreCalculator {
  private analyzers: FactorAnalyzer[];
  private factorWeights: Record<string, number>;

  constructor(analyzers: FactorAnalyzer[], options?: ScoreCalculatorOptions) {
    this.analyzers = analyzers;
    
    // Initialize weights from analyzers
    const defaultWeights: Record<string, number> = {};
    let totalWeight = 0;
    
    for (const analyzer of analyzers) {
      const name = analyzer.getName();
      const weight = analyzer.getWeight();
      defaultWeights[name] = weight;
      totalWeight += weight;
    }
    
    // Normalize weights if they don't sum to 1
    if (Math.abs(totalWeight - 1) > 0.001) {
      for (const name in defaultWeights) {
        defaultWeights[name] /= totalWeight;
      }
    }
    
    // Override with custom weights if provided
    this.factorWeights = options?.factorWeights || defaultWeights;
  }

  /**
   * Calculate the reputation score for a server using all analyzers
   */
  async calculateScore(server: MCPServer): Promise<ReputationScoreDetails> {
    const factorScores: Record<string, FactorAnalysisResult> = {};
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Run all analyzers
    for (const analyzer of this.analyzers) {
      const name = analyzer.getName();
      try {
        const result = await analyzer.analyze(server);
        factorScores[name] = result;
        
        // Calculate weighted contribution
        const weight = this.factorWeights[name] || 0;
        const contribution = result.score * weight * result.confidence;
        
        weightedSum += contribution;
        totalWeight += weight * result.confidence;
      } catch (error) {
        console.error(`Error in analyzer ${name}:`, error);
        factorScores[name] = {
          score: 0,
          confidence: 0,
          details: { error: String(error) }
        };
      }
    }
    
    // Calculate overall score
    const overallScore = totalWeight > 0 
      ? Math.round(weightedSum / totalWeight) 
      : 0;
    
    return {
      overallScore,
      factorScores,
      calculatedAt: new Date()
    };
  }

  /**
   * Generate a detailed breakdown of score components
   */
  getScoreBreakdown(scoreDetails: ReputationScoreDetails): Record<string, any> {
    const breakdown = {
      overallScore: scoreDetails.overallScore,
      factors: {} as Record<string, any>,
      factorContributions: {} as Record<string, number>,
      calculatedAt: scoreDetails.calculatedAt
    };
    
    let totalWeightedContribution = 0;
    
    for (const [name, result] of Object.entries(scoreDetails.factorScores)) {
      const weight = this.factorWeights[name] || 0;
      const adjustedWeight = weight * result.confidence;
      const contribution = (result.score * adjustedWeight);
      totalWeightedContribution += contribution;
      
      breakdown.factors[name] = {
        score: result.score,
        confidence: result.confidence,
        weight,
        details: result.details
      };
      
      breakdown.factorContributions[name] = contribution;
    }
    
    // Convert contributions to percentages
    if (totalWeightedContribution > 0) {
      for (const name in breakdown.factorContributions) {
        breakdown.factorContributions[name] = Math.round(
          (breakdown.factorContributions[name] / totalWeightedContribution) * 100
        );
      }
    }
    
    return breakdown;
  }
} 