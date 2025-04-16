import { ScoreCalculator } from '../utils/score-calculator';
import { FactorAnalyzer, FactorAnalysisResult } from '../types';

// Create mock analyzers for testing
class MockAnalyzer implements FactorAnalyzer {
  private name: string;
  private weight: number;
  private mockScore: number;
  private mockConfidence: number;

  constructor(name: string, weight: number, mockScore: number, mockConfidence: number = 1.0) {
    this.name = name;
    this.weight = weight;
    this.mockScore = mockScore;
    this.mockConfidence = mockConfidence;
  }

  async analyze(): Promise<FactorAnalysisResult> {
    return {
      score: this.mockScore,
      confidence: this.mockConfidence,
      details: { mocked: true }
    };
  }

  getName(): string {
    return this.name;
  }

  getWeight(): number {
    return this.weight;
  }
}

describe('ScoreCalculator', () => {
  test('should calculate overall score based on factor analyzers', async () => {
    // Create mock analyzers with predefined scores
    const analyzers: FactorAnalyzer[] = [
      new MockAnalyzer('github', 0.35, 80),      // GitHub score: 80
      new MockAnalyzer('maintenance', 0.25, 70),  // Maintenance score: 70
      new MockAnalyzer('opensource', 0.20, 90),   // Open Source score: 90
      new MockAnalyzer('license', 0.20, 85)       // License score: 85
    ];

    const calculator = new ScoreCalculator(analyzers);
    
    // Analyze a mock server
    const mockServer = { id: 'test-server-id' } as any;
    const result = await calculator.calculateScore(mockServer);
    
    // Expected score calculation:
    // (80 * 0.35) + (70 * 0.25) + (90 * 0.20) + (85 * 0.20) = 81
    expect(result.overallScore).toBe(81);
    
    // Check that all factor scores are included
    expect(result.factorScores).toHaveProperty('github');
    expect(result.factorScores).toHaveProperty('maintenance');
    expect(result.factorScores).toHaveProperty('opensource');
    expect(result.factorScores).toHaveProperty('license');
  });

  test('should apply custom weights when provided', async () => {
    // Create mock analyzers
    const analyzers: FactorAnalyzer[] = [
      new MockAnalyzer('github', 0.25, 80),
      new MockAnalyzer('maintenance', 0.25, 70),
      new MockAnalyzer('opensource', 0.25, 90),
      new MockAnalyzer('license', 0.25, 85)
    ];
    
    // Custom weights that prioritize open source and license
    const customWeights = {
      github: 0.15,
      maintenance: 0.15,
      opensource: 0.35,
      license: 0.35
    };

    const calculator = new ScoreCalculator(analyzers, { factorWeights: customWeights });
    
    // Analyze a mock server
    const mockServer = { id: 'test-server-id' } as any;
    const result = await calculator.calculateScore(mockServer);
    
    // Expected score calculation with custom weights:
    // (80 * 0.15) + (70 * 0.15) + (90 * 0.35) + (85 * 0.35) = 84.25 ≈ 84
    expect(result.overallScore).toBe(84);
  });

  test('should handle analyzers with low confidence', async () => {
    // Create mock analyzers with varying confidence
    const analyzers: FactorAnalyzer[] = [
      new MockAnalyzer('github', 0.25, 80, 1.0),       // Full confidence
      new MockAnalyzer('maintenance', 0.25, 70, 0.8),  // 80% confidence
      new MockAnalyzer('opensource', 0.25, 90, 0.5),   // 50% confidence
      new MockAnalyzer('license', 0.25, 85, 0.0)       // 0% confidence (should be ignored)
    ];

    const calculator = new ScoreCalculator(analyzers);
    
    // Analyze a mock server
    const mockServer = { id: 'test-server-id' } as any;
    const result = await calculator.calculateScore(mockServer);
    
    // Check that all factor scores are included
    expect(result.factorScores).toHaveProperty('github');
    expect(result.factorScores).toHaveProperty('maintenance');
    expect(result.factorScores).toHaveProperty('opensource');
    expect(result.factorScores).toHaveProperty('license');
    
    // Score should be weighted by confidence, and license should contribute 0
    // The formula is more complex here, but we can check that it's reasonable
    expect(result.overallScore).toBeGreaterThan(75);
    expect(result.overallScore).toBeLessThan(85);
  });
}); 