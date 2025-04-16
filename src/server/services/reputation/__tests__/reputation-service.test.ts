import { ReputationScoringService } from '../';
import { GitHubMetricsAnalyzer } from '../analyzers/github-metrics-analyzer';
import { MaintenanceFrequencyAnalyzer } from '../analyzers/maintenance-analyzer';
import { OpenSourceStatusAnalyzer } from '../analyzers/opensource-analyzer';
import { LicenseTypeAnalyzer } from '../analyzers/license-analyzer';

// Mock the required dependencies
jest.mock('.prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      mCPServer: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      reputationScore: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((data: { data: any }) => Promise.resolve(data.data)),
        count: jest.fn().mockResolvedValue(0),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    })),
  };
});

jest.mock('../analyzers', () => ({
  getAnalyzers: jest.fn().mockReturnValue([]),
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn(),
  }),
}));

describe('ReputationScoringService', () => {
  let service: ReputationScoringService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReputationScoringService();
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('should start and initialize the service', async () => {
    // Mock the internal method directly instead of using spyOn
    const originalMethod = (service as any).calculateAllScores;
    (service as any).calculateAllScores = jest.fn().mockResolvedValueOnce(undefined);
    
    await service.start();
    
    expect((service as any).calculateAllScores).toHaveBeenCalled();
    // Restore original method
    (service as any).calculateAllScores = originalMethod;
  });

  test('should stop the service', () => {
    service.stop();
    // This just tests that the method doesn't throw an error
    expect(true).toBeTruthy();
  });

  test('should trigger calculation', async () => {
    // Mock the internal method directly instead of using spyOn
    const originalMethod = (service as any).calculateAllScores;
    (service as any).calculateAllScores = jest.fn().mockResolvedValueOnce(undefined);
    
    await service.triggerCalculation();
    
    expect((service as any).calculateAllScores).toHaveBeenCalled();
    // Restore original method
    (service as any).calculateAllScores = originalMethod;
  });
});

describe('Factor Analyzers', () => {
  test('GitHub Metrics Analyzer should be defined', () => {
    const analyzer = new GitHubMetricsAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.getName()).toBe('github');
  });

  test('Maintenance Frequency Analyzer should be defined', () => {
    const analyzer = new MaintenanceFrequencyAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.getName()).toBe('maintenance');
  });

  test('Open Source Status Analyzer should be defined', () => {
    const analyzer = new OpenSourceStatusAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.getName()).toBe('opensource');
  });

  test('License Type Analyzer should be defined', () => {
    const analyzer = new LicenseTypeAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.getName()).toBe('license');
  });
}); 