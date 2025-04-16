import { getAnalyzers } from '../analyzers';
import { FactorAnalyzer } from '../types';
import { MCPServer } from '.prisma/client';

// Directly mock the analyzer modules
jest.mock('../analyzers/github-metrics-analyzer', () => {
  return {
    GitHubMetricsAnalyzer: jest.fn().mockImplementation(() => ({
      getName: () => 'github',
      getWeight: () => 0.35,
      analyze: jest.fn().mockResolvedValue({
        score: 85,
        confidence: 1.0,
        details: { mocked: true }
      })
    }))
  };
});

jest.mock('../analyzers/maintenance-analyzer', () => {
  return {
    MaintenanceFrequencyAnalyzer: jest.fn().mockImplementation(() => ({
      getName: () => 'maintenance',
      getWeight: () => 0.25,
      analyze: jest.fn().mockResolvedValue({
        score: 70,
        confidence: 0.9,
        details: { mocked: true }
      })
    }))
  };
});

jest.mock('../analyzers/opensource-analyzer', () => {
  return {
    OpenSourceStatusAnalyzer: jest.fn().mockImplementation(() => ({
      getName: () => 'opensource',
      getWeight: () => 0.20,
      analyze: jest.fn().mockResolvedValue({
        score: 90,
        confidence: 1.0,
        details: { mocked: true }
      })
    }))
  };
});

jest.mock('../analyzers/license-analyzer', () => {
  return {
    LicenseTypeAnalyzer: jest.fn().mockImplementation(() => ({
      getName: () => 'license',
      getWeight: () => 0.20,
      analyze: jest.fn().mockResolvedValue({
        score: 95,
        confidence: 0.9,
        details: { mocked: true }
      })
    }))
  };
});

describe('Analyzers Collection', () => {
  const mockServer = {
    id: 'test-id',
    name: 'Test Server'
  } as MCPServer;

  test('getAnalyzers returns the correct number of analyzers', () => {
    const analyzers = getAnalyzers();
    expect(analyzers.length).toBe(4);
    
    // Check that all analyzers are present
    const analyzerNames = analyzers.map(a => a.getName());
    expect(analyzerNames).toContain('github');
    expect(analyzerNames).toContain('maintenance');
    expect(analyzerNames).toContain('opensource');
    expect(analyzerNames).toContain('license');
  });

  test('All analyzers can be called with a server object', async () => {
    const analyzers = getAnalyzers();
    
    for (const analyzer of analyzers) {
      const result = await analyzer.analyze(mockServer);
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.details).toBeDefined();
    }
  });

  test('Analyzers return expected scores based on mocks', async () => {
    const analyzers = getAnalyzers();
    
    // GitHub analyzer should return score of 85
    const githubAnalyzer = analyzers.find(a => a.getName() === 'github');
    expect(githubAnalyzer).toBeDefined();
    if (githubAnalyzer) {
      const result = await githubAnalyzer.analyze(mockServer);
      expect(result.score).toBe(85);
    }
    
    // Maintenance analyzer should return score of 70
    const maintAnalyzer = analyzers.find(a => a.getName() === 'maintenance');
    expect(maintAnalyzer).toBeDefined();
    if (maintAnalyzer) {
      const result = await maintAnalyzer.analyze(mockServer);
      expect(result.score).toBe(70);
    }
    
    // Open source analyzer should return score of 90
    const osAnalyzer = analyzers.find(a => a.getName() === 'opensource');
    expect(osAnalyzer).toBeDefined();
    if (osAnalyzer) {
      const result = await osAnalyzer.analyze(mockServer);
      expect(result.score).toBe(90);
    }
    
    // License analyzer should return score of 95
    const licenseAnalyzer = analyzers.find(a => a.getName() === 'license');
    expect(licenseAnalyzer).toBeDefined();
    if (licenseAnalyzer) {
      const result = await licenseAnalyzer.analyze(mockServer);
      expect(result.score).toBe(95);
    }
  });
}); 