// @ts-ignore - Import PrismaClient directly from .prisma/client
import { PrismaClient, ReputationScore } from '.prisma/client';
import { ScoreHistory } from '../types';

export class HistoryTracker {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Store a new reputation score in the database, preserving history
   */
  async trackScore(
    serverId: string, 
    overallScore: number, 
    maintenanceScore?: number, 
    communityScore?: number, 
    stabilityScore?: number, 
    documentationScore?: number,
    securityScore?: number
  ): Promise<ReputationScore> {
    try {
      return await this.prisma.reputationScore.create({
        data: {
          serverId,
          overallScore,
          maintenanceScore,
          communityScore,
          stabilityScore,
          documentationScore,
          securityScore,
          calculatedAt: new Date()
        }
      });
    } catch (error) {
      console.error(`Error tracking score for server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * Get historical scores for a server
   */
  async getScoreHistory(serverId: string, limit: number = 10): Promise<ScoreHistory> {
    try {
      const scores = await this.prisma.reputationScore.findMany({
        where: { serverId },
        orderBy: { calculatedAt: 'desc' },
        take: limit
      });
      
      return {
        serverId,
        scores
      };
    } catch (error) {
      console.error(`Error fetching score history for server ${serverId}:`, error);
      return {
        serverId,
        scores: []
      };
    }
  }

  /**
   * Get the most recent score for a server
   */
  async getLatestScore(serverId: string): Promise<ReputationScore | null> {
    try {
      return await this.prisma.reputationScore.findFirst({
        where: { serverId },
        orderBy: { calculatedAt: 'desc' }
      });
    } catch (error) {
      console.error(`Error fetching latest score for server ${serverId}:`, error);
      return null;
    }
  }

  /**
   * Calculate score trend (positive, negative, or neutral)
   */
  calculateTrend(history: ScoreHistory): 'positive' | 'negative' | 'neutral' | null {
    if (!history.scores || history.scores.length < 2) {
      return null; // Not enough data for trend analysis
    }
    
    // Get the most recent and second most recent scores
    const [latest, previous] = history.scores;
    
    // Calculate difference
    const difference = latest.overallScore - previous.overallScore;
    
    // Determine trend
    if (difference > 3) return 'positive';
    if (difference < -3) return 'negative';
    return 'neutral';
  }

  /**
   * Delete old scores beyond a certain limit
   */
  async pruneHistory(serverId: string, keepCount: number = 20): Promise<number> {
    try {
      // Get scores ordered by date
      const scores = await this.prisma.reputationScore.findMany({
        where: { serverId },
        orderBy: { calculatedAt: 'desc' },
        select: { id: true }
      });
      
      // If we have more than keepCount, delete the oldest ones
      if (scores.length > keepCount) {
        const scoreIdsToDelete = scores.slice(keepCount).map(s => s.id);
        
        const result = await this.prisma.reputationScore.deleteMany({
          where: {
            id: { in: scoreIdsToDelete }
          }
        });
        
        return result.count;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error pruning history for server ${serverId}:`, error);
      return 0;
    }
  }
} 