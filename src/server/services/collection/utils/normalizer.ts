import { MCPServerData, NormalizedData } from '../types';

export class DataNormalizer {
  normalize(dataSets: MCPServerData[][]): NormalizedData {
    // Group servers by URL to combine data from different sources
    const serverMap = new Map<string, MCPServerData>();
    
    // Process all data sets
    for (const dataSet of dataSets) {
      for (const server of dataSet) {
        if (!server.url) continue;
        
        // If we already have data for this server, merge the new data
        if (serverMap.has(server.url)) {
          const existingServer = serverMap.get(server.url)!;
          
          // Merge server data
          serverMap.set(server.url, this.mergeServerData(existingServer, server));
        } else {
          // First time seeing this server
          serverMap.set(server.url, { ...server });
        }
      }
    }
    
    // Convert the map to an array
    return {
      mcpServers: Array.from(serverMap.values()),
    };
  }
  
  private mergeServerData(existing: MCPServerData, newData: MCPServerData): MCPServerData {
    // Simple merging strategy - prefer non-empty values
    return {
      name: existing.name || newData.name,
      description: existing.description || newData.description,
      url: existing.url, // URL is the key, so it must exist
      repositoryUrl: existing.repositoryUrl || newData.repositoryUrl,
      license: existing.license || newData.license,
      owner: existing.owner || newData.owner,
      ownerType: existing.ownerType || newData.ownerType,
      
      // Merge categories - use a Set to avoid duplicates
      categories: [
        ...(existing.categories || []),
        ...(newData.categories || []),
      ].filter((v, i, a) => a.indexOf(v) === i),
      
      // Merge capabilities by name
      capabilities: this.mergeCapabilities(
        existing.capabilities || [],
        newData.capabilities || []
      ),
      
      // For repo metrics, we can just overwrite if they exist
      repoMetrics: newData.repoMetrics || existing.repoMetrics,
    };
  }
  
  private mergeCapabilities(
    existing: MCPServerData['capabilities'] = [],
    newOnes: MCPServerData['capabilities'] = []
  ): MCPServerData['capabilities'] {
    const result = [...existing];
    
    // For each new capability, check if we already have it
    for (const newCap of newOnes) {
      const existingIndex = result.findIndex(cap => cap.name === newCap.name);
      
      if (existingIndex >= 0) {
        // Update existing capability
        result[existingIndex] = {
          ...result[existingIndex],
          description: result[existingIndex].description || newCap.description,
          details: result[existingIndex].details || newCap.details,
        };
      } else {
        // Add new capability
        result.push(newCap);
      }
    }
    
    return result;
  }
} 