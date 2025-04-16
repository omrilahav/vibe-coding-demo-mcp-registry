# API Endpoints Reference

This document provides detailed information about all available API endpoints in the MCP Registry.

## Servers

### List All Servers
`GET /api/v1/servers`

Retrieves a list of all registered MCP servers.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)
- `sort` (optional): Sort field (default: "reputation")
- `order` (optional): Sort order ("asc" or "desc", default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "servers": [
      {
        "id": "server_123",
        "name": "Example MCP Server",
        "url": "https://example.com/mcp",
        "description": "An example MCP server",
        "reputation": 95,
        "status": "active",
        "lastSeen": "2024-03-20T15:30:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

### Get Server Details
`GET /api/v1/servers/{id}`

Retrieves detailed information about a specific server.

**Path Parameters:**
- `id`: Server ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "server_123",
    "name": "Example MCP Server",
    "url": "https://example.com/mcp",
    "description": "An example MCP server",
    "reputation": 95,
    "status": "active",
    "lastSeen": "2024-03-20T15:30:00Z",
    "capabilities": ["text", "image", "audio"],
    "metrics": {
      "uptime": 99.9,
      "responseTime": 150,
      "successRate": 98.5
    },
    "contact": {
      "email": "admin@example.com",
      "website": "https://example.com"
    }
  }
}
```

### Register New Server
`POST /api/v1/servers`

Registers a new MCP server in the directory.

**Request Body:**
```json
{
  "name": "New MCP Server",
  "url": "https://newserver.com/mcp",
  "description": "A new MCP server",
  "capabilities": ["text", "image"],
  "contact": {
    "email": "admin@newserver.com",
    "website": "https://newserver.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "server_124",
    "name": "New MCP Server",
    "url": "https://newserver.com/mcp",
    "status": "pending_verification"
  }
}
```

### Update Server
`PUT /api/v1/servers/{id}`

Updates information for an existing server.

**Path Parameters:**
- `id`: Server ID

**Request Body:**
```json
{
  "description": "Updated server description",
  "capabilities": ["text", "image", "video"],
  "contact": {
    "email": "newemail@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "server_123",
    "description": "Updated server description",
    "capabilities": ["text", "image", "video"],
    "updatedAt": "2024-03-20T16:00:00Z"
  }
}
```

## Reputation

### Get Server Reputation
`GET /api/v1/servers/{id}/reputation`

Retrieves detailed reputation information for a server.

**Path Parameters:**
- `id`: Server ID

**Response:**
```json
{
  "success": true,
  "data": {
    "serverId": "server_123",
    "overall": 95,
    "components": {
      "uptime": 98,
      "performance": 94,
      "reliability": 93,
      "userFeedback": 95
    },
    "history": [
      {
        "timestamp": "2024-03-20T00:00:00Z",
        "score": 95
      }
    ]
  }
}
```

### Submit Feedback
`POST /api/v1/servers/{id}/feedback`

Submits user feedback for a server.

**Path Parameters:**
- `id`: Server ID

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent service and response time",
  "metrics": {
    "reliability": 5,
    "performance": 4,
    "support": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "feedback_123",
    "timestamp": "2024-03-20T16:30:00Z",
    "status": "accepted"
  }
}
```

## Search

### Search Servers
`GET /api/v1/search`

Searches for servers based on various criteria.

**Query Parameters:**
- `q` (optional): Search query string
- `capabilities` (optional): Array of required capabilities
- `minReputation` (optional): Minimum reputation score
- `status` (optional): Server status filter
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "server_123",
        "name": "Example MCP Server",
        "description": "Matches your search criteria",
        "reputation": 95,
        "relevance": 0.92
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### Get Search Suggestions
`GET /api/v1/search/suggest`

Gets search suggestions based on partial input.

**Query Parameters:**
- `q`: Partial search query
- `limit` (optional): Maximum number of suggestions (default: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "example server",
        "type": "server_name"
      },
      {
        "text": "example capability",
        "type": "capability"
      }
    ]
  }
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error context"
    }
  }
}
```

Common error codes:
- `INVALID_REQUEST`: The request was malformed
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per minute per IP
- Headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset` 