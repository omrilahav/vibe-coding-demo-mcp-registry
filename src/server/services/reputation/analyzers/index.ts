import { GitHubMetricsAnalyzer } from './github-metrics-analyzer';
import { MaintenanceFrequencyAnalyzer } from './maintenance-analyzer';
import { OpenSourceStatusAnalyzer } from './opensource-analyzer';
import { LicenseTypeAnalyzer } from './license-analyzer';
import { FactorAnalyzer } from '../types';

/**
 * Get all available factor analyzers with default weights
 */
export function getAnalyzers(): FactorAnalyzer[] {
  return [
    new GitHubMetricsAnalyzer(),
    new MaintenanceFrequencyAnalyzer(),
    new OpenSourceStatusAnalyzer(),
    new LicenseTypeAnalyzer()
  ];
}

export { 
  GitHubMetricsAnalyzer,
  MaintenanceFrequencyAnalyzer, 
  OpenSourceStatusAnalyzer,
  LicenseTypeAnalyzer 
}; 