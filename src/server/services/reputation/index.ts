// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient, MCPServer, ReputationScore } from '.prisma/client';
import { getAnalyzers } from './analyzers';
import { ScoreCalculator, HistoryTracker } from './utils';
import { CalculateOptions, FactorAnalyzer, ReputationScoreDetails, ReputationScoringConfig } from './types';
import * as cron from 'node-cron';

/**
 * Reputation Scoring Service implementation
 * Manages the calculation and storage of reputation scores for MCP servers
 */
class ReputationScoringServiceImpl {
  private prisma: PrismaClient;
  private calculator: ScoreCalculator;
  private historyTracker: HistoryTracker;
  private analyzers: FactorAnalyzer[];
  private isCalculating: boolean = false;
  private cronJob?: cron.ScheduledTask;
  
  constructor(config?: ReputationScoringConfig) {
    this.prisma = new PrismaClient();
    this.historyTracker = new HistoryTracker();
    this.analyzers = getAnalyzers();
    this.calculator = new ScoreCalculator(this.analyzers, {
      factorWeights: config?.factorWeights
    });
  }

  /**
   * Start the scoring service
   */
  async start(): Promise<void> {
    // Check if we need to calculate scores on startup
    const shouldCalculate = await this.shouldCalculateOnStartup();
    if (shouldCalculate) {
      await this.calculateAllScores();
    }

    // Set up scheduled calculation (every day at 4 AM)
    this.cronJob = cron.schedule('0 4 * * *', async () => {
      await this.calculateAllScores();
    });
  }

  /**
   * Stop the scoring service
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  /**
   * Manually trigger score calculation for all servers
   */
  async triggerCalculation(options?: CalculateOptions): Promise<void> {
    await this.calculateAllScores(options);
  }
  
  /**
   * Calculate reputation score for a single server
   */
  async calculateScore(server: MCPServer, options?: CalculateOptions): Promise<ReputationScore> {
    // Check if we need to calculate a new score
    if (!options?.forceRecalculate) {
      const latestScore = await this.historyTracker.getLatestScore(server.id);
      
      // If we have a recent score (less than 24 hours old), use that
      if (latestScore && this.isScoreRecent(latestScore.calculatedAt)) {
        return latestScore;
      }
    }
    
    // Calculate a new score
    const scoreDetails = await this.calculator.calculateScore(server);
    
    // Map the scores to our database model
    // Extract factor-specific scores for storage
    const factorScores = scoreDetails.factorScores;
    
    // Store the new score in the database
    const score = await this.historyTracker.trackScore(
      server.id,
      scoreDetails.overallScore,
      factorScores.maintenance?.score,
      factorScores.github?.score,
      factorScores.opensource?.score,
      factorScores.license?.score,
      undefined // Security score not implemented yet
    );
    
    // Prune old history
    await this.historyTracker.pruneHistory(server.id);
    
    return score;
  }
  
  /**
   * Get the reputation score for a server
   */
  async getScore(serverId: string): Promise<ReputationScore | null> {
    return this.historyTracker.getLatestScore(serverId);
  }
  
  /**
   * Get the reputation score history for a server
   */
  async getScoreHistory(serverId: string, limit: number = 10): Promise<ReputationScore[]> {
    const history = await this.historyTracker.getScoreHistory(serverId, limit);
    return history.scores;
  }
  
  /**
   * Get a detailed breakdown of the score components
   */
  async getScoreBreakdown(serverId: string): Promise<Record<string, any> | null> {
    // Get the server
    const server = await this.prisma.mCPServer.findUnique({
      where: { id: serverId }
    });
    
    if (!server) {
      return null;
    }
    
    // Calculate a fresh score breakdown
    const scoreDetails = await this.calculator.calculateScore(server);
    
    // Get the breakdown
    return this.calculator.getScoreBreakdown(scoreDetails);
  }
  
  /**
   * Get the trend direction for a server
   */
  async getScoreTrend(serverId: string): Promise<'positive' | 'negative' | 'neutral' | null> {
    const history = await this.historyTracker.getScoreHistory(serverId, 5);
    return this.historyTracker.calculateTrend(history);
  }

  /**
   * Determine if we should calculate scores on startup
   */
  private async shouldCalculateOnStartup(): Promise<boolean> {
    // Check if there are any reputation scores in the database
    const scoreCount = await this.prisma.reputationScore.count();
    if (scoreCount === 0) return true;

    // Check when the last score was calculated
    const latestScore = await this.prisma.reputationScore.findFirst({
      orderBy: { calculatedAt: 'desc' },
    });

    // If no scores or last calculation was more than 24 hours ago
    if (!latestScore) return true;

    const lastUpdate = new Date(latestScore.calculatedAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return lastUpdate < oneDayAgo;
  }

  /**
   * Calculate scores for all servers
   */
  private async calculateAllScores(options?: CalculateOptions): Promise<void> {
    // Prevent concurrent calculation
    if (this.isCalculating) {
      console.log('Reputation score calculation already in progress');
      return;
    }

    this.isCalculating = true;

    try {
      console.log('Starting reputation score calculation...');

      // Get all active MCP servers
      const servers = await this.prisma.mCPServer.findMany({
        where: { isActive: true }
      });

      // Calculate scores for each server
      for (const server of servers) {
        try {
          await this.calculateScore(server, options);
        } catch (error) {
          console.error(`Error calculating score for server ${server.name}:`, error);
        }
      }

      console.log('Reputation score calculation completed successfully');
    } catch (error) {
      console.error('Error in reputation score calculation process:', error);
    } finally {
      this.isCalculating = false;
    }
  }
  
  /**
   * Check if a score is recent (less than 24 hours old)
   */
  private isScoreRecent(calculatedAt: Date): boolean {
    const now = new Date();
    const scoreDate = new Date(calculatedAt);
    const hoursDifference = (now.getTime() - scoreDate.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 24;
  }
}

// Create and export a singleton instance
const reputationScoringService = new ReputationScoringServiceImpl();
export default reputationScoringService;

// Export the class with a type alias to preserve API compatibility
export { ReputationScoringServiceImpl as ReputationScoringService }; 