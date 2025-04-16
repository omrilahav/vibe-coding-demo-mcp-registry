// Types for data collection service

export interface MCPServerData {
  name: string;
  description?: string;
  url: string;
  repositoryUrl?: string;
  license?: string;
  owner?: string;
  ownerType?: string;
  categories?: string[];
  capabilities?: {
    name: string;
    description?: string;
    details?: string;
  }[];
  repoMetrics?: {
    stars?: number;
    forks?: number;
    watchers?: number;
    lastCommitDate?: Date;
    openIssuesCount?: number;
    contributorsCount?: number;
  };
}

export interface SourceAdapter {
  getName(): string;
  collect(): Promise<MCPServerData[]>;
  updateDataSource(): Promise<void>;
}

export interface CollectionOptions {
  forceUpdate?: boolean;
  sources?: string[];
}

export interface NormalizedData {
  mcpServers: MCPServerData[];
} 