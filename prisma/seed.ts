import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create data sources
  const githubSource = await prisma.dataSource.upsert({
    where: { name: 'GitHub' },
    update: {},
    create: {
      name: 'GitHub',
      sourceType: 'github',
      baseUrl: 'https://api.github.com',
      status: 'active'
    }
  });

  const glamaSource = await prisma.dataSource.upsert({
    where: { name: 'Glama.ai' },
    update: {},
    create: {
      name: 'Glama.ai',
      sourceType: 'web',
      baseUrl: 'https://glama.ai',
      status: 'active'
    }
  });

  console.log('Created data sources:', { githubSource, glamaSource });

  // Create categories
  const categories = [
    { name: 'File Access', description: 'Tools that provide access to local or remote files' },
    { name: 'Database', description: 'Tools that interact with databases' },
    { name: 'API Integration', description: 'Tools that provide access to external APIs' },
    { name: 'Data Processing', description: 'Tools that help process or analyze data' },
    { name: 'Code Generation', description: 'Tools that generate or manipulate code' },
    { name: 'Search', description: 'Tools that enable searching through various data sources' }
  ];

  const createdCategories = [];
  
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
    createdCategories.push(createdCategory);
  }

  console.log(`Created ${createdCategories.length} categories`);

  // Create example MCP servers
  const servers = [
    {
      name: 'File Browser MCP',
      description: 'A secure MCP server for browsing and managing local files',
      url: 'https://github.com/example/file-browser-mcp',
      repositoryUrl: 'https://github.com/example/file-browser-mcp',
      license: 'MIT',
      owner: 'example',
      ownerType: 'organization',
      isActive: true,
      isVerified: true,
      categoryIds: [createdCategories[0].id] // File Access
    },
    {
      name: 'SQL Query MCP',
      description: 'MCP server for executing SQL queries against various database engines',
      url: 'https://github.com/dbtools/sql-query-mcp',
      repositoryUrl: 'https://github.com/dbtools/sql-query-mcp',
      license: 'Apache-2.0',
      owner: 'dbtools',
      ownerType: 'organization',
      isActive: true,
      isVerified: true,
      categoryIds: [createdCategories[1].id] // Database
    },
    {
      name: 'Weather API MCP',
      description: 'MCP server that provides access to weather data from multiple sources',
      url: 'https://github.com/weather-tools/weather-api-mcp',
      repositoryUrl: 'https://github.com/weather-tools/weather-api-mcp',
      license: 'GPL-3.0',
      owner: 'weather-tools',
      ownerType: 'organization',
      isActive: true,
      isVerified: false,
      categoryIds: [createdCategories[2].id] // API Integration
    },
    {
      name: 'Code Assistant MCP',
      description: 'An MCP server that helps generate and refactor code in multiple languages',
      url: 'https://github.com/devtools/code-assistant-mcp',
      repositoryUrl: 'https://github.com/devtools/code-assistant-mcp',
      license: 'MIT',
      owner: 'devtools',
      ownerType: 'organization',
      isActive: true,
      isVerified: true,
      categoryIds: [createdCategories[4].id] // Code Generation
    }
  ];

  const createdServers = [];
  
  for (const server of servers) {
    const { categoryIds, ...serverData } = server;
    
    // Create the server first
    const createdServer = await prisma.mCPServer.create({
      data: serverData
    });
    
    // Then create the relationships with categories
    if (categoryIds && categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await prisma.categoryToServer.create({
          data: {
            serverId: createdServer.id,
            categoryId: categoryId
          }
        });
      }
    }
    
    createdServers.push(createdServer);
  }
  
  // Add reputation scores for each server
  for (let i = 0; i < createdServers.length; i++) {
    await prisma.reputationScore.create({
      data: {
        serverId: createdServers[i].id,
        overallScore: 70 + Math.floor(Math.random() * 30), // 70-100 range
        maintenanceScore: 60 + Math.floor(Math.random() * 40),
        communityScore: 60 + Math.floor(Math.random() * 40),
        stabilityScore: 70 + Math.floor(Math.random() * 30),
        documentationScore: 50 + Math.floor(Math.random() * 50),
        securityScore: 60 + Math.floor(Math.random() * 40)
      }
    });
  }

  // Add capabilities
  const capabilities = [
    {
      name: 'File Reading',
      description: 'Can read files from local filesystem',
      serverId: createdServers[0].id,
      details: JSON.stringify({ permissions: ['read'] })
    },
    {
      name: 'SQL Execution',
      description: 'Can execute SQL queries against supported databases',
      serverId: createdServers[1].id,
      details: JSON.stringify({ databases: ['MySQL', 'PostgreSQL', 'SQLite'] })
    },
    {
      name: 'Weather Forecast',
      description: 'Can provide weather forecasts for any location',
      serverId: createdServers[2].id,
      details: JSON.stringify({ sources: ['OpenWeatherMap', 'WeatherAPI'] })
    },
    {
      name: 'Code Generation',
      description: 'Can generate code snippets in multiple languages',
      serverId: createdServers[3].id,
      details: JSON.stringify({ languages: ['JavaScript', 'Python', 'Java', 'C#'] })
    }
  ];
  
  for (const capability of capabilities) {
    await prisma.capability.create({
      data: capability
    });
  }

  console.log(`Created ${createdServers.length} MCP servers with reputation scores and capabilities`);

  // Create some user contributions
  const contributions = [
    {
      serverId: createdServers[0].id,
      contributionType: 'feedback',
      content: 'This server works great with large files, but could use better error handling.',
      submitterName: 'John Doe',
      submitterEmail: 'john@example.com',
      status: 'approved'
    },
    {
      serverId: createdServers[1].id,
      contributionType: 'feedback',
      content: 'The SQL query feature is excellent, but I found an issue with transactions.',
      submitterName: 'Jane Smith',
      submitterEmail: 'jane@example.com',
      status: 'approved'
    },
    {
      contributionType: 'new_server',
      content: JSON.stringify({
        name: 'Image Analysis MCP',
        description: 'An MCP server for analyzing and processing images',
        url: 'https://github.com/imagetools/analysis-mcp',
        license: 'MIT'
      }),
      submitterName: 'Alex Johnson',
      submitterEmail: 'alex@example.com',
      status: 'pending'
    }
  ];

  for (const contribution of contributions) {
    await prisma.userContribution.create({
      data: contribution
    });
  }

  console.log(`Created ${contributions.length} user contributions`);

  console.log('Database seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 