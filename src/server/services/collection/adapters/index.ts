import { GitHubAdapter } from './github';
import { GlamaAdapter } from './glamai';
import { SourceAdapter } from '../types';

export function getAdapters(): SourceAdapter[] {
  return [
    new GitHubAdapter(),
    new GlamaAdapter(),
  ];
}

export { GitHubAdapter, GlamaAdapter }; 